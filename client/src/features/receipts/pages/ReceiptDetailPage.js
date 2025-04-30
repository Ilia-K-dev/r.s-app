import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReceipts } from '../hooks/useReceipts';
import { useToast } from '../../../shared/hooks/useToast';
import { PageHeader } from '../../../shared/components/layout/PageHeader';
import { ReceiptDetail } from '../components/ReceiptDetail';
import { ReceiptEdit } from '../components/ReceiptEdit';
import { Button } from '../../../shared/components/forms/Button';
import { Alert } from '../../../shared/components/ui/Alert';
import { Loading } from '../../../shared/components/ui/Loading';
import { Modal } from '../../../shared/components/ui/Modal';
import { ChevronLeft, Edit, Trash, Download } from 'lucide-react';

const ReceiptDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { getReceiptById, updateReceipt, deleteReceipt } = useReceipts();

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch receipt data
  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        setLoading(true);
        const data = await getReceiptById(id);
        setReceipt(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching receipt:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReceipt();
    }
  }, [id, getReceiptById]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async (updatedData) => {
    try {
      await updateReceipt(id, updatedData);
      setReceipt(prevReceipt => ({
        ...prevReceipt,
        ...updatedData
      }));
      setIsEditing(false);
      showToast('Receipt updated successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update receipt', 'error');
      console.error('Error updating receipt:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteReceipt(id);
      showToast('Receipt deleted successfully', 'success');
      navigate('/receipts');
    } catch (err) {
      showToast(err.message || 'Failed to delete receipt', 'error');
      console.error('Error deleting receipt:', err);
    }
  };

  const handleDownload = async () => {
    try {
      if (!receipt.imageUrl) {
        throw new Error('No image available');
      }

      // Create a link element and trigger download
      const link = document.createElement('a');
      link.href = receipt.imageUrl;
      link.download = `receipt-${receipt.merchant}-${id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      showToast('Failed to download receipt image', 'error');
      console.error('Error downloading receipt:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert 
          type="error"
          title="Error loading receipt"
          message={error}
        />
        <Button
          variant="secondary"
          icon={ChevronLeft}
          onClick={() => navigate('/receipts')}
          className="mt-4"
        >
          Back to Receipts
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={isEditing ? "Edit Receipt" : "Receipt Details"}
        showBack
        onBack={() => navigate('/receipts')}
        action={
          !isEditing && (
            <div className="flex space-x-2">
              {receipt.imageUrl && (
                <Button
                  variant="secondary"
                  icon={Download}
                  onClick={handleDownload}
                >
                  Download
                </Button>
              )}
              <Button
                variant="secondary"
                icon={Edit}
                onClick={handleEdit}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                icon={Trash}
                onClick={() => setShowDeleteModal(true)}
              >
                Delete
              </Button>
            </div>
          )
        }
      />

      {isEditing ? (
        <ReceiptEdit
          receipt={receipt}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <ReceiptDetail
          receipt={receipt}
          imageUrl={receipt.imageUrl}
          onDownload={handleDownload}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Receipt"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this receipt? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={Trash}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReceiptDetailPage;
