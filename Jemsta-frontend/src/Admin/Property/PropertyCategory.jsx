import React, { useState } from 'react';
import PageHeader from '../shared/PageHeader';
import AdminTable, { AdminTr, AdminTd, StatusBadge, ActionButtons } from '../shared/AdminTable';
import Modal from '../shared/Modal';
import { FormInput, FormSelect, ModalActions } from '../shared/FormFields';

const initialCategories = [
  { id: 1, name: 'Apartment', featured: 'Yes', status: 'Active' },
  { id: 2, name: 'Building',  featured: 'Yes', status: 'Active' },
  { id: 3, name: 'Office',    featured: 'Yes', status: 'Active' },
  { id: 4, name: 'Room',      featured: 'Yes', status: 'Active' },
  { id: 5, name: 'Flat',      featured: 'Yes', status: 'Active' },
  { id: 6, name: 'Land',      featured: 'Yes', status: 'Active' },
];

const emptyForm = { name: '', status: '' };

const PropertyCategory = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd  = () => { setEditingItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (c) => { setEditingItem(c); setForm({ name: c.name, status: c.status }); setShowModal(true); };
  const closeModal = () => setShowModal(false);
  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = () => {
    if (editingItem) {
      setCategories((prev) => prev.map((c) => c.id === editingItem.id ? { ...c, ...form } : c));
    } else {
      setCategories((prev) => [...prev, { ...form, id: Date.now(), featured: 'Yes' }]);
    }
    closeModal();
  };

  const handleDelete = (id) => setCategories((prev) => prev.filter((c) => c.id !== id));

  return (
    <div>
      <PageHeader title="Categories" buttonLabel="Add New" onButtonClick={openAdd} />

      <AdminTable columns={['S/N', 'Name', 'Featured', 'Status', 'Action']}>
        {categories.map((c, i) => (
          <AdminTr key={c.id}>
            <AdminTd>{i + 1}</AdminTd>
            <AdminTd>{c.name}</AdminTd>
            <AdminTd>{c.featured}</AdminTd>
            <AdminTd><StatusBadge status={c.status} /></AdminTd>
            <AdminTd>
              <ActionButtons onEdit={() => openEdit(c)} onDelete={() => handleDelete(c.id)} />
            </AdminTd>
          </AdminTr>
        ))}
      </AdminTable>

      {showModal && (
        <Modal onClose={closeModal}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <FormInput label="Name:" placeholder="Enter text here" value={form.name} onChange={set('name')} />
            <FormSelect label="Status:" placeholder="Select Status" value={form.status} onChange={set('status')}
              options={['Active', 'Inactive']} />
          </div>
          <ModalActions onCancel={closeModal} onSubmit={handleSubmit} />
        </Modal>
      )}
    </div>
  );
};

export default PropertyCategory;
