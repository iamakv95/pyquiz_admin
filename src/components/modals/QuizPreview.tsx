import { useQuery } from '@tanstack/react-query';
import { X, Clock, Award, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { quizService, quizQuestionService } from '../../services/content.service';
import type { Database } from '../../types/database.types';

type Quiz = Database['public']['Tables']['quizzes']['Row'];

interface QuizPreviewProps {
  quiz: Quiz;
  onClose: () => void;
}

interface MarkingScheme {
  correct: number;
  incorrect: number;
  unattempted: number;
}

const QuizPreview = ({ quiz, onClose }: QuizPreviewProps) => {
  // Fetch quiz questions with details
  const { data: quizStructure, isLoading } = useQuery({
    queryKey: ['quiz-structure', quiz.id],
    queryFn: () => quizQuestionService.getByQuizWithDetails(quiz.id),
  });

  const markingScheme = quiz.marking_scheme as MarkingScheme;
  const questionCount = quizStructure?.length || 0;
  const totalMarks = quizStructure?.reduce((sum, q) => sum + q.marks, 0) || 0;

  // Group questions by section
  const sections = quizStructure?.reduce((acc, q) => {
    const sectionId = q.section_id || 'unassigned';
    if (!acc[sectionId]) {
      acc[sectionId] = {
        id: sectionId,
        name: q.section_name || 'Unassigned Questions',
        name_hi: q.section_name_hi || 'असाइन नहीं किए गए प्रश्न',
        questions: [],
      };
    }
    acc[sectionId].questions.push(q);
    return acc;
  }, {} as Record<string, any>);

  const sectionsList = sections ? Object.values(sections) : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Quiz Preview</h2>
            <p className="text-sm text-gray-500 mt-1">
              {quiz.is_published ? (
                <span className="inline-flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Published
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-gray-500">
                  <XCircle className="w-4 h-4" />
                  Draft
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Quiz Title */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{quiz.title}</h3>
            <p className="text-lg text-gray-600 mt-1">{quiz.title_hi}</p>
            {quiz.description && (
              <div className="mt-3">
                <p className="text-gray-700">{quiz.description}</p>
                {quiz.description_hi && (
                  <p className="text-gray-600 mt-1">{quiz.description_hi}</p>
                )}
              </div>
            )}
          </div>

          {/* Quiz Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Duration</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{quiz.duration_minutes}</p>
              <p className="text-xs text-blue-600">minutes</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <Award className="w-4 h-4" />
                <span className="text-sm font-medium">Total Marks</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{totalMarks}</p>
              <p className="text-xs text-green-600">marks</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">Questions</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{questionCount}</p>
              <p className="text-xs text-purple-600">total</p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <span className="text-sm font-medium">Type</span>
              </div>
              <p className="text-lg font-bold text-orange-900 capitalize">{quiz.type}</p>
              <p className="text-xs text-orange-600">{quiz.scope}</p>
            </div>
          </div>

          {/* PYQ Metadata */}
          {quiz.is_pyq && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">PYQ Details</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Year:</span>
                  <span className="ml-2 font-medium text-blue-900">{quiz.year}</span>
                </div>
                {quiz.tier && (
                  <div>
                    <span className="text-blue-600">Tier:</span>
                    <span className="ml-2 font-medium text-blue-900">{quiz.tier}</span>
                  </div>
                )}
                {quiz.shift && (
                  <div>
                    <span className="text-blue-600">Shift:</span>
                    <span className="ml-2 font-medium text-blue-900">{quiz.shift}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Marking Scheme */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Marking Scheme</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Correct:</span>
                <span className="font-bold text-green-600">+{markingScheme.correct}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">Incorrect:</span>
                <span className="font-bold text-red-600">{markingScheme.incorrect}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600">Unattempted:</span>
                <span className="font-bold text-gray-600">{markingScheme.unattempted}</span>
              </div>
            </div>
            <div className="mt-3 text-sm">
              <span className="text-gray-600">Negative Marking:</span>
              <span className={`ml-2 font-medium ${quiz.negative_marking ? 'text-red-600' : 'text-gray-500'}`}>
                {quiz.negative_marking ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {/* Quiz Structure */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 mt-2">Loading quiz structure...</p>
            </div>
          ) : questionCount === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <BookOpen className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
              <p className="text-yellow-800 font-medium">No questions added yet</p>
              <p className="text-yellow-600 text-sm mt-1">
                Use the Quiz Builder to add questions to this quiz
              </p>
            </div>
          ) : (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Quiz Structure</h4>
              <div className="space-y-4">
                {sectionsList.map((section, idx) => (
                  <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h5 className="font-medium text-gray-900">
                          {section.id === 'unassigned' ? section.name : `Section ${idx + 1}: ${section.name}`}
                        </h5>
                        <p className="text-sm text-gray-600">{section.name_hi}</p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {section.questions.length} question{section.questions.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {section.questions.map((q: any, qIdx: number) => (
                        <div
                          key={q.id}
                          className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded"
                        >
                          <span className="text-sm text-gray-700">
                            Question {q.display_order}
                          </span>
                          <span className="text-sm font-medium text-primary-600">
                            {q.marks} mark{q.marks !== 1 ? 's' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPreview;
