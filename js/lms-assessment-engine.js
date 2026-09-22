/* ============================================================
   INSTRUCTIFY KENYA — LMS ASSESSMENT ENGINE
   Question renderers, automatic/manual grading, quiz timer,
   question randomisation, attempt tracking, and score recording.
   ============================================================ */

(function(window) {
  'use strict';

  const SUBMISSIONS_KEY = 'ik_lms_submissions';

  // ── Question Type Registry ──────────────────────────────────
  const QUESTION_TYPES = {
    mcq:           { label: 'Multiple Choice', icon: '🔘', autoGrade: true },
    multi_answer:  { label: 'Multiple Answer', icon: '☑️', autoGrade: true },
    true_false:    { label: 'True or False',   icon: '✅', autoGrade: true },
    matching:      { label: 'Matching',        icon: '🔗', autoGrade: true },
    short_answer:  { label: 'Short Answer',    icon: '✏️', autoGrade: false },
    essay:         { label: 'Essay',           icon: '📝', autoGrade: false },
    file_upload:   { label: 'File Upload',     icon: '📎', autoGrade: false }
  };

  // ── Storage Helpers ─────────────────────────────────────────
  function getSubmissions() {
    try { return JSON.parse(localStorage.getItem(SUBMISSIONS_KEY)) || []; }
    catch { return []; }
  }

  function saveSubmissions(subs) {
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(subs));
  }

  // ── Shuffle Array (Fisher-Yates) ────────────────────────────
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ── Quiz Timer ──────────────────────────────────────────────
  let timerInterval = null;
  let timerSeconds = 0;
  let timerCallback = null;

  function startTimer(durationMinutes, onTick, onExpire) {
    stopTimer();
    timerSeconds = durationMinutes * 60;
    timerCallback = onExpire;

    timerInterval = setInterval(function() {
      timerSeconds--;
      if (onTick) onTick(timerSeconds);
      if (timerSeconds <= 0) {
        stopTimer();
        if (timerCallback) timerCallback();
      }
    }, 1000);

    if (onTick) onTick(timerSeconds);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  // ── Auto-Grading Engine ─────────────────────────────────────
  function gradeQuestion(question, answer) {
    const type = question.type;
    const result = { questionId: question.id, answer: answer, correct: false, score: 0, maxScore: 1, feedback: '' };

    switch (type) {
      case 'mcq':
      case 'true_false':
        result.correct = (answer === question.correctAnswer);
        result.score = result.correct ? 1 : 0;
        result.feedback = result.correct
          ? (question.feedbackCorrect || question.explanation || 'Correct!')
          : (question.feedbackIncorrect || question.explanation || 'Incorrect.');
        break;

      case 'multi_answer':
        if (Array.isArray(answer) && Array.isArray(question.correctAnswers)) {
          const sortedA = [...answer].sort();
          const sortedC = [...question.correctAnswers].sort();
          result.correct = JSON.stringify(sortedA) === JSON.stringify(sortedC);
          // Partial credit: count correct selections
          const correctCount = answer.filter(a => question.correctAnswers.includes(a)).length;
          const wrongCount = answer.filter(a => !question.correctAnswers.includes(a)).length;
          result.score = Math.max(0, (correctCount - wrongCount) / question.correctAnswers.length);
          result.feedback = result.correct ? 'All correct!' : 'Some answers were incorrect.';
        }
        break;

      case 'matching':
        if (typeof answer === 'object' && question.correctPairs) {
          let matched = 0;
          const total = Object.keys(question.correctPairs).length;
          for (const key in question.correctPairs) {
            if (answer[key] === question.correctPairs[key]) matched++;
          }
          result.score = total > 0 ? matched / total : 0;
          result.correct = matched === total;
          result.feedback = `${matched} of ${total} pairs matched correctly.`;
        }
        break;

      case 'short_answer':
        // Basic auto-grade: exact match (case-insensitive)
        if (question.acceptedAnswers && Array.isArray(question.acceptedAnswers)) {
          const normalised = (answer || '').trim().toLowerCase();
          result.correct = question.acceptedAnswers.some(a => a.trim().toLowerCase() === normalised);
          result.score = result.correct ? 1 : 0;
          result.feedback = result.correct ? 'Correct!' : 'This answer requires manual review.';
        } else {
          result.feedback = 'Submitted for manual grading.';
          result.score = -1; // -1 = pending manual grade
        }
        break;

      case 'essay':
      case 'file_upload':
        result.feedback = 'Submitted for manual grading.';
        result.score = -1; // pending
        break;
    }

    return result;
  }

  function gradeQuiz(questions, answers, settings) {
    settings = settings || {};
    const results = [];
    let totalScore = 0;
    let maxScore = 0;
    let pendingManual = 0;

    questions.forEach(function(q) {
      const answer = answers[q.id];
      const result = gradeQuestion(q, answer);
      results.push(result);

      if (result.score === -1) {
        pendingManual++;
        maxScore++;
      } else {
        totalScore += result.score;
        maxScore++;
      }
    });

    const autoPercent = maxScore > pendingManual
      ? Math.round((totalScore / (maxScore - pendingManual)) * 100)
      : 0;

    const passed = settings.passMark
      ? autoPercent >= settings.passMark
      : null;

    return {
      results: results,
      totalScore: totalScore,
      maxScore: maxScore,
      percentage: autoPercent,
      passed: passed,
      pendingManual: pendingManual,
      passMark: settings.passMark || null,
      completedAt: new Date().toISOString()
    };
  }

  // ── Submission Management ───────────────────────────────────
  function createSubmission(data) {
    const subs = getSubmissions();
    const submission = {
      id: 'sub_' + Date.now().toString(36),
      studentId: data.studentId,
      courseId: data.courseId,
      assessmentId: data.assessmentId,
      assessmentTitle: data.assessmentTitle || '',
      type: data.type || 'quiz', // quiz, assignment, project
      answers: data.answers || {},
      gradeResult: data.gradeResult || null,
      score: data.score || null,
      maxScore: data.maxScore || null,
      percentage: data.percentage || null,
      passed: data.passed || null,
      status: data.status || 'submitted', // submitted, graded, returned, resubmit
      feedback: data.feedback || '',
      fileUrl: data.fileUrl || null,
      submittedAt: new Date().toISOString(),
      gradedAt: null,
      gradedBy: null,
      attemptNumber: data.attemptNumber || 1
    };

    subs.unshift(submission);
    saveSubmissions(subs);
    return submission;
  }

  function getSubmissionsForStudent(studentId, courseId) {
    return getSubmissions().filter(function(s) {
      if (courseId) return s.studentId === studentId && s.courseId === courseId;
      return s.studentId === studentId;
    });
  }

  function getSubmissionsForAssessment(assessmentId) {
    return getSubmissions().filter(function(s) {
      return s.assessmentId === assessmentId;
    });
  }

  function getPendingGrading(educatorCourseIds) {
    return getSubmissions().filter(function(s) {
      return s.status === 'submitted' && educatorCourseIds.includes(s.courseId);
    });
  }

  function gradeSubmission(submissionId, score, maxScore, feedback, gradedBy) {
    const subs = getSubmissions();
    const sub = subs.find(function(s) { return s.id === submissionId; });
    if (!sub) return null;

    sub.score = score;
    sub.maxScore = maxScore;
    sub.percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    sub.feedback = feedback;
    sub.status = 'graded';
    sub.gradedAt = new Date().toISOString();
    sub.gradedBy = gradedBy;

    saveSubmissions(subs);
    return sub;
  }

  function getAttemptCount(studentId, assessmentId) {
    return getSubmissions().filter(function(s) {
      return s.studentId === studentId && s.assessmentId === assessmentId;
    }).length;
  }

  // ── Question Renderer ───────────────────────────────────────
  function renderQuestion(question, index, answers) {
    answers = answers || {};
    const qNum = index + 1;
    let html = `
      <div class="lms-question-block" data-question-id="${question.id}">
        <div class="lms-question-number">Question ${qNum}</div>
        <div class="lms-question-text">${question.text}</div>
        <div class="lms-question-options">
    `;

    switch (question.type) {
      case 'mcq':
      case 'true_false':
        const opts = question.options || [];
        opts.forEach(function(opt, i) {
          const letters = 'ABCDEFGHIJ';
          const selected = answers[question.id] === i ? ' selected' : '';
          html += `
            <label class="lms-option${selected}" onclick="LMSAssessment.selectOption('${question.id}', ${i}, this)">
              <span class="option-marker">${letters[i]}</span>
              <span>${opt}</span>
            </label>
          `;
        });
        break;

      case 'multi_answer':
        (question.options || []).forEach(function(opt, i) {
          const checked = Array.isArray(answers[question.id]) && answers[question.id].includes(i);
          html += `
            <label class="lms-option${checked ? ' selected' : ''}">
              <input type="checkbox" ${checked ? 'checked' : ''} 
                onchange="LMSAssessment.toggleMultiOption('${question.id}', ${i})"
                style="accent-color:#2145E6;width:18px;height:18px;cursor:pointer;">
              <span>${opt}</span>
            </label>
          `;
        });
        break;

      case 'short_answer':
        html += `
          <input type="text" class="lms-input" placeholder="Type your answer..."
            value="${answers[question.id] || ''}"
            onchange="LMSAssessment._answers['${question.id}'] = this.value">
        `;
        break;

      case 'essay':
        html += `
          <textarea class="lms-textarea" rows="6" placeholder="Write your essay response..."
            onchange="LMSAssessment._answers['${question.id}'] = this.value">${answers[question.id] || ''}</textarea>
        `;
        break;

      case 'file_upload':
        html += `
          <div style="border:2px dashed #CBD5E1;border-radius:12px;padding:32px;text-align:center;">
            <div style="font-size:32px;margin-bottom:8px;">📎</div>
            <div style="font-size:14px;font-weight:600;color:#334155;margin-bottom:4px;">Upload your file</div>
            <div style="font-size:12px;color:#94A3B8;margin-bottom:12px;">PDF, DOC, DOCX, PPT, or ZIP (max 25MB)</div>
            <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.zip" 
              onchange="LMSAssessment._answers['${question.id}'] = this.files[0] ? this.files[0].name : ''"
              style="font-size:13px;">
          </div>
        `;
        break;
    }

    html += `
        </div>
        <div class="lms-question-feedback" id="feedback-${question.id}"></div>
      </div>
    `;

    return html;
  }

  // ── Render Full Quiz ────────────────────────────────────────
  function renderQuiz(containerId, questions, settings) {
    const container = document.getElementById(containerId);
    if (!container) return;

    settings = settings || {};
    let displayQuestions = [...questions];

    // Randomise questions if enabled
    if (settings.randomiseQuestions) {
      displayQuestions = shuffle(displayQuestions);
    }

    // Randomise answer options if enabled
    if (settings.randomiseAnswers) {
      displayQuestions = displayQuestions.map(function(q) {
        if (['mcq', 'multi_answer'].includes(q.type) && q.options) {
          // Create index mapping for correct answer tracking
          const indexed = q.options.map(function(opt, i) { return { text: opt, originalIndex: i }; });
          const shuffled = shuffle(indexed);
          const newCorrect = shuffled.findIndex(function(item) {
            return item.originalIndex === q.correctAnswer;
          });
          return {
            ...q,
            options: shuffled.map(function(item) { return item.text; }),
            correctAnswer: newCorrect,
            _shuffleMap: shuffled.map(function(item) { return item.originalIndex; })
          };
        }
        return q;
      });
    }

    // Store display questions for grading
    LMSAssessment._currentQuestions = displayQuestions;
    LMSAssessment._answers = {};
    LMSAssessment._settings = settings;

    let html = '';

    // Quiz header
    html += '<div class="lms-quiz-header">';
    html += `<div style="font-size:14px;font-weight:700;color:#0F172A;">${displayQuestions.length} Questions</div>`;
    if (settings.timeLimit) {
      html += `<div class="lms-quiz-timer" id="quiz-timer">⏱ ${formatTime(settings.timeLimit * 60)}</div>`;
    }
    if (settings.passMark) {
      html += `<div style="font-size:12px;color:#64748B;">Pass mark: ${settings.passMark}%</div>`;
    }
    html += '</div>';

    // Questions
    displayQuestions.forEach(function(q, i) {
      html += renderQuestion(q, i, {});
    });

    // Submit button
    html += `
      <div style="text-align:center;padding:24px 0;">
        <button class="lms-btn lms-btn-primary lms-btn-lg" onclick="LMSAssessment.submitQuiz('${containerId}')">
          Submit Quiz
        </button>
      </div>
    `;

    container.innerHTML = html;

    // Start timer if configured
    if (settings.timeLimit) {
      startTimer(settings.timeLimit, function(secs) {
        const el = document.getElementById('quiz-timer');
        if (el) {
          el.textContent = '⏱ ' + formatTime(secs);
          if (secs <= 60) el.classList.add('warning');
        }
      }, function() {
        LMSAssessment.submitQuiz(containerId);
      });
    }
  }

  // ── Public Assessment API ───────────────────────────────────
  window.LMSAssessment = {
    QUESTION_TYPES: QUESTION_TYPES,
    _answers: {},
    _currentQuestions: [],
    _settings: {},

    renderQuiz: renderQuiz,
    gradeQuiz: gradeQuiz,
    gradeQuestion: gradeQuestion,
    createSubmission: createSubmission,
    getSubmissionsForStudent: getSubmissionsForStudent,
    getSubmissionsForAssessment: getSubmissionsForAssessment,
    getPendingGrading: getPendingGrading,
    gradeSubmission: gradeSubmission,
    getAttemptCount: getAttemptCount,
    shuffle: shuffle,
    formatTime: formatTime,
    startTimer: startTimer,
    stopTimer: stopTimer,

    // UI interaction handlers
    selectOption: function(questionId, optionIndex, element) {
      this._answers[questionId] = optionIndex;
      // Update UI
      const block = element.closest('.lms-question-block');
      if (block) {
        block.querySelectorAll('.lms-option').forEach(function(opt) {
          opt.classList.remove('selected');
        });
        element.classList.add('selected');
      }
    },

    toggleMultiOption: function(questionId, optionIndex) {
      if (!Array.isArray(this._answers[questionId])) {
        this._answers[questionId] = [];
      }
      const idx = this._answers[questionId].indexOf(optionIndex);
      if (idx >= 0) {
        this._answers[questionId].splice(idx, 1);
      } else {
        this._answers[questionId].push(optionIndex);
      }
    },

    submitQuiz: function(containerId) {
      stopTimer();

      const result = gradeQuiz(this._currentQuestions, this._answers, this._settings);

      // Show results inline
      this._currentQuestions.forEach(function(q) {
        const feedback = document.getElementById('feedback-' + q.id);
        const block = document.querySelector('[data-question-id="' + q.id + '"]');
        const gradeResult = result.results.find(function(r) { return r.questionId === q.id; });

        if (feedback && gradeResult && gradeResult.score !== -1) {
          feedback.className = 'lms-question-feedback visible ' + (gradeResult.correct ? 'correct' : 'incorrect');
          feedback.innerHTML = (gradeResult.correct ? '✅ ' : '❌ ') + gradeResult.feedback;
        }

        // Highlight correct/incorrect options
        if (block && ['mcq', 'true_false'].includes(q.type)) {
          const options = block.querySelectorAll('.lms-option');
          options.forEach(function(opt, i) {
            opt.classList.remove('selected');
            if (i === q.correctAnswer) opt.classList.add('correct');
            else if (i === LMSAssessment._answers[q.id] && i !== q.correctAnswer) opt.classList.add('incorrect');
          });
        }
      });

      // Show summary
      const container = document.getElementById(containerId);
      if (container) {
        const summaryHtml = `
          <div class="lms-card" style="margin-top:24px;text-align:center;padding:32px;">
            <div style="font-size:48px;margin-bottom:12px;">${result.passed === false ? '📝' : '🎉'}</div>
            <h3 style="font-size:22px;font-weight:800;color:#0F172A;margin-bottom:8px;">
              ${result.passed === false ? 'Keep Practising!' : 'Quiz Complete!'}
            </h3>
            <div style="font-size:36px;font-weight:900;color:${result.passed === false ? '#DC2626' : '#059669'};margin:16px 0;">
              ${result.percentage}%
            </div>
            <div style="font-size:14px;color:#64748B;margin-bottom:4px;">
              ${Math.round(result.totalScore)} of ${result.maxScore} correct
            </div>
            ${result.passMark ? `<div style="font-size:13px;color:#94A3B8;">Pass mark: ${result.passMark}%</div>` : ''}
            ${result.pendingManual > 0 ? `<div style="font-size:13px;color:#D97706;margin-top:8px;">⏳ ${result.pendingManual} question(s) pending manual grading</div>` : ''}
          </div>
        `;
        container.insertAdjacentHTML('beforeend', summaryHtml);

        // Disable all interactions
        container.querySelectorAll('.lms-option, .lms-btn-primary, input, textarea').forEach(function(el) {
          el.style.pointerEvents = 'none';
        });
      }

      // Dispatch event for course player integration
      window.dispatchEvent(new CustomEvent('lms:quiz-completed', { detail: result }));

      return result;
    }
  };

})(window);
