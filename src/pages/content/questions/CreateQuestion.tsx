import { useNavigate } from 'react-router-dom';
import { QuestionForm } from '../../../components/forms';
import { questionService } from '../../../services/content.service';

const CreateQuestion = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    try {
      // Remove subject_id as it doesn't exist in the questions table
      // Keep exam_id as it's required in the database
      const { tags, subject_id, ...questionData } = data;
      
      await questionService.createWithTags(questionData, tags || []);
      alert('Question created successfully!');
      navigate('/content/questions');
    } catch (error) {
      console.error('Failed to create question:', error);
      throw error; // Let the form handle the error
    }
  };

  return (
    <div className="p-6">
      <QuestionForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/content/questions')}
        mode="create"
      />
    </div>
  );
};

export default CreateQuestion;
