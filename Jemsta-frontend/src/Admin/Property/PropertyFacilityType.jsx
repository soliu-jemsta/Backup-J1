import React, { useState } from 'react';
import PageHeader from '../shared/PageHeader';
import AdminTable, { AdminTr, AdminTd, StatusBadge, ActionButtons } from '../shared/AdminTable';
import Modal from '../shared/Modal';
import { FormInput, FormSelect, ModalActions } from '../shared/FormFields';

const initialFacilities = [
  { id: 1, name: 'Lift',        featured: 'Yes', status: 'Active' },
  { id: 2, name: 'Parking',     featured: 'Yes', status: 'Active' },
  { id: 3, name: 'Water',       featured: 'Yes', status: 'Active' },
  { id: 4, name: 'Balcony',     featured: 'Yes', status: 'Active' },
  { id: 5, name: 'Bath',        featured: 'Yes', status: 'Active' },
  { id: 6, name: 'Bed',         featured: 'Yes', status: 'Active' },
  { id: 7, name: 'Electricity', featured: 'Yes', status: 'Active' },
  { id: 8, name: 'Gas',         featured: 'Yes', status: 'Active' },
  { id: 9, name: 'Internet',    featured: 'Yes', status: 'Active' },
];

const emptyForm = { name: '', status: '' };

const PropertyFacilityType = () => {
  const [facilities, setFacilities] = useState(initialFacilities);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd  = () => { setEditingItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (f) => { setEditingItem(f); setForm({ name: f.name, status: f.status }); setShowModal(true); };
  const closeModal = () => setShowModal(false);
  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = () => {
    if (editingItem) {
      setFacilities((prev) => prev.map((f) => f.id === editingItem.id ? { ...f, ...form } : f));
    } else {
      setFacilities((prev) => [...prev, { ...form, id: Date.now(), featured: 'Yes' }]);
    }
    closeModal();
  };

  const handleDelete = (id) => setFacilities((prev) => prev.filter((f) => f.id !== id));

  return (
    <div>
      <PageHeader title="Facility Type" buttonLabel="Add New" onButtonClick={openAdd} />

      <AdminTable columns={['S/N', 'Name', 'Featured', 'Status', 'Action']}>
        {facilities.map((f, i) => (
          <AdminTr key={f.id}>
            <AdminTd>{i + 1}</AdminTd>
            <AdminTd>{f.name}</AdminTd>
            <AdminTd>{f.featured}</AdminTd>
            <AdminTd><StatusBadge status={f.status} /></AdminTd>
            <AdminTd>
              <ActionButtons onEdit={() => openEdit(f)} onDelete={() => handleDelete(f.id)} />
            </AdminTd>
          </AdminTr>
        ))}
      </AdminTable>

      {showModal && (
        <Modal onClose={closeModal}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <FormInput
              label="Name:"
              placeholder="Enter text here"
              value={form.name}
              onChange={set('name')}
            />
            <FormSelect
              label="Status:"
              placeholder="Select Status"
              value={form.status}
              onChange={set('status')}
              options={['Active', 'Inactive']}
            />
          </div>
          <ModalActions onCancel={closeModal} onSubmit={handleSubmit} />
        </Modal>
      )}
    </div>
  );
};

export default PropertyFacilityType;
