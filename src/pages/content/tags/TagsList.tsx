import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Tag as TagIcon } from 'lucide-react';
import { tagService } from '../../../services/content.service';
import type { Database } from '../../../types/database.types';

type Tag = Database['public']['Tables']['tags']['Row'];
type TagInsert = Database['public']['Tables']['tags']['Insert'];

const TagsList = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_hi: '',
    type: 'concept' as 'concept' | 'pattern' | 'skill' | 'exam_behavior',
  });
  const [filterType, setFilterType] = useState<string>('');

  // Fetch tags
  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagService.getAll(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: TagInsert) => tagService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      handleCloseModal();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => tagService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  const handleOpenModal = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({
        name: tag.name,
        name_hi: tag.name_hi,
        type: tag.type,
      });
    } else {
      setEditingTag(null);
      setFormData({
        name: '',
        name_hi: '',
        type: 'concept',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTag(null);
    setFormData({
      name: '',
      name_hi: '',
      type: 'concept',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the tag "${name}"? This action cannot be undone.`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting tag:', error);
        alert('Failed to delete tag. It may be in use by questions.');
      }
    }
  };

  const filteredTags = filterType
    ? tags.filter(tag => tag.type === filterType)
    : tags;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'concept': return 'bg-blue-100 text-blue-800';
      case 'pattern': return 'bg-green-100 text-green-800';
      case 'skill': return 'bg-purple-100 text-purple-800';
      case 'exam_behavior': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'concept': return 'Concept';
      case 'pattern': return 'Pattern';
      case 'skill': return 'Skill';
      case 'exam_behavior': return 'Exam Behavior';
      default: return type;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tags Management</h1>
            <p className="text-gray-600 mt-1">Manage question tags and categories</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Create Tag
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="concept">Concept</option>
            <option value="pattern">Pattern</option>
            <option value="skill">Skill</option>
            <option value="exam_behavior">Exam Behavior</option>
          </select>
        </div>
      </div>

      {/* Tags Grid */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading tags...</div>
        ) : filteredTags.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No tags found. Create your first tag to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {filteredTags.map((tag) => (
              <div
                key={tag.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TagIcon size={20} className="text-gray-400" />
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(tag.type)}`}>
                      {getTypeLabel(tag.type)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenModal(tag)}
                      className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id, tag.name)}
                      className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{tag.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{tag.name_hi}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingTag ? 'Edit Tag' : 'Create New Tag'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Algebra"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Hindi) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name_hi}
                  onChange={(e) => setFormData({ ...formData, name_hi: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., बीजगणित"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="concept">Concept</option>
                  <option value="pattern">Pattern</option>
                  <option value="skill">Skill</option>
                  <option value="exam_behavior">Exam Behavior</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Concept: Topic-based tags | Pattern: Question patterns | Skill: Required skills | Exam Behavior: Exam-specific traits
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Saving...' : editingTag ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagsList;
