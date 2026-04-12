import { useState, useEffect } from 'react';
import { X } from 'react-bootstrap-icons';
import { createReport } from '../../api/report.api';
import './ReportModal.css';

const REPORT_REASONS = [
    { value: 'SPAM', label: 'Spam' },
    { value: 'INAPPROPRIATE', label: 'Inappropriate Content' },
    { value: 'FALSE_REVIEW', label: 'False or Misleading Information' },
    { value: 'HARASSMENT', label: 'Harassment or Hate Speech' },
    { value: 'INCORRECT_INFORMATION', label: 'Incorrect Information' }
];

const ReportModal = ({ show, onClose, place }) => {
    const [reason, setReason] = useState('SPAM');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            setError('Please log in to submit a report');
            return;
        }

        if (!description.trim()) {
            setError('Please provide a description');
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            await createReport({
                reason,
                description,
                reporterId: user.id,
                placeId: place.id
            });

            alert('Report submitted successfully. Thank you for helping us maintain quality!');
            setReason('SPAM');
            setDescription('');
            onClose();
        } catch (err) {
            console.error('Error submitting report:', err);
            setError(err.response?.data?.error || 'Failed to submit report');
        } finally {
            setSubmitting(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Report {place?.name}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    {user ? (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="reason">Reason for Report</label>
                                <select
                                    id="reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    required
                                >
                                    {REPORT_REASONS.map(r => (
                                        <option key={r.value} value={r.value}>
                                            {r.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Please provide details about why you're reporting this place..."
                                    rows="5"
                                    required
                                />
                            </div>

                            {error && <div className="error-message">{error}</div>}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={onClose}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-submit-report"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Report'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="login-prompt">
                            <p>Please log in to submit a report</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
