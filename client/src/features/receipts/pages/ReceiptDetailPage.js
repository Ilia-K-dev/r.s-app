import React, { useState, useEffect } from 'react';//correct
import { useParams, useNavigate } from 'react-router-dom';//correct
import { useReceipts } from '../../../features/receipts/hooks/useReceipts';//correct
import { useToast } from '../../../shared/hooks/useToast';//correct
import { PageHeader } from '../../../shared/components/layout/PageHeader';//correct
import { ReceiptPreview } from '../../../features/documents/components/ReceiptPreview';//correct
import { ReceiptEdit } from '../../../features/receipts/components/ReceiptEdit';//correct
import { Button } from '../../../shared/components/forms/Button';//correct
import { Alert } from '../../../shared/components/ui/Alert';//correct
import { Loading } from '../../../shared/components/ui/Loading'; //correct
import { Modal } from '../../../shared/components/ui/Modal';//correct
import { logger } from '../../../shared/utils/logger';//correct
import { ChevronLeft, Edit, Trash, Download } from 'lucide-react';//correct

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
        logger.error('Error fetching receipt:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
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
      logger.error('Error updating receipt:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteReceipt(id);
      showToast('Receipt deleted successfully', 'success');
      navigate('/receipts');
    } catch (err) {
      showToast(err.message || 'Failed to delete receipt', 'error');
      logger.error('Error deleting receipt:', err);
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
      logger.error('Error downloading receipt:', err);
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
        <ReceiptPreview
          receipt={receipt}
          imageUrl={receipt.imageUrl}
          onEdit={handleEdit}
          onDelete={() => setShowDeleteModal(true)}
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