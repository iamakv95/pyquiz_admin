import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { QuestionForm } from '../../../components/forms';
import { useQuestion } from '../../../hooks/useQuestions';
import { questionService } from '../../../services/content.service';

const EditQuestion = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: question, isLoading } = useQuestion(id!);
  const [questionTags, setQuestionTags] = useState<string[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      questionService.getQuestionTags(id)
        .then(tags => {
          setQuestionTags(tags);
          setTagsLoading(false);
        })
        .catch(error => {
          console.error('Error loading tags:', error);
          setTagsLoading(false);
        });
    }
  }, [id]);

  const handleSubmit = async (data: any) => {
    try {
      // Remove subject_id as it doesn't exist in the questions table
      // Keep exam_id as it's required in the database
      const { tags, subject_id, ...questionData } = data;
      
      await questionService.updateWithTags(id!, questionData, tags || []);
      alert('Question updated successfully!');
      navigate('/content/questions');
    } catch (error) {
      console.error('Failed to update question:', error);
      throw error; // Let the form handle the error
    }
  };

  if (isLoading || tagsLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading question...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Question not found</p>
          <button
            onClick={() => navigate('/content/questions')}
            className="mt-2 text-red-600 hover:text-red-700 underline"
          >
            Back to Questions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <QuestionForm
        initialData={{
          exam_id: question.exam_id,
          subject_id: question.topic?.subject_id || '',
          question_content: question.question_content as any,
          options: question.options as any,
          correct_option: question.correct_option,
          explanation_content: question.explanation_content as any,
          topic_id: question.topic_id,
          subtopic_id: question.subtopic_id,
          difficulty: question.difficulty,
          is_pyq: question.is_pyq,
          year: question.year,
          tier: question.tier,
          shift: question.shift,
          tags: questionTags,
          comprehension_group_id: question.comprehension_group_id,
        }}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/content/questions')}
        mode="edit"
      />
    </div>
  );
};

export default EditQuestion;
