import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../shared/PageHeader';
import AdminTable, { AdminTr, AdminTd, ActionButtons } from '../shared/AdminTable';
import Modal from '../shared/Modal';
import { FormInput, FormSelect, FormTextarea, FormFilePicker, GoogleAddressInput, ModalActions } from '../shared/FormFields';
import { useToast } from '../shared/ToastProvider';
import {
  LISTING_TYPE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  TENURE_OPTIONS,
  STATUS_OPTIONS,
  listingTypeLabel,
  propertyTypeLabel,
  statusLabel,
} from './propertyOptions';


// const BASE_URL = 'http://127.0.0.1:8000/api';

const emptyForm = {
  name: '', address: '', rent_amount: '',
  landlord: '', listing_type: '',
  bedrooms: '', bathrooms: '', property_type: '', tenure: '',
  status: 'available', is_vacant: false, available_from: '',
  town: '', postcode: '', description: '', key_features: '',
};

const parseResponse = async (response) => {
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    const error = new Error('Request failed');
    error.data = data;
    throw error;
  }
  return data;
};

const Property = () => {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [properties, setProperties] = useState([]);
  const [landlords,  setLandlords]  = useState([]);
  const [managers,   setManagers]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [showModal,  setShowModal]  = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form,       setForm]       = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [images,        setImages]        = useState([]);
  const [submitting,    setSubmitting]    = useState(false);
  // Images picked in the modal (create OR edit) that haven't been uploaded
  // yet — held as File objects and uploaded only once Save is pressed.
  const [pendingImages, setPendingImages] = useState([]);

  useEffect(() => {
    Promise.all([
      authFetch(`${BASE_URL}/properties/properties/`).then(r => { if (!r.ok) throw new Error(`Server error: ${r.status}`); return r.json(); }),
      authFetch(`${BASE_URL}/landlords/`).then(r => r.json()).catch(() => []),
      authFetch(`${BASE_URL}/users/users/`).then(r => r.json()).catch(() => []),
    ])
      .then(([propsData, llData, usersData]) => {
        console.log('Fetched properties:', propsData);
        setProperties(Array.isArray(propsData) ? propsData : []);
        setLandlords(Array.isArray(llData) ? llData : []);
        // Filter managers: staff users (new role-based system)
        const mgrs = Array.isArray(usersData)
          ? usersData.filter(u => u.role === 'staff')
          : [];
        setManagers(mgrs);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const openAdd = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setFormErrors({});
    setImages([]);
    setPendingImages([]);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingItem(p);
    setForm({
      name:            p.name            || '',
      address:         p.address         || '',
      rent_amount:     p.rent_amount     || '',
      landlord:        p.landlord        != null ? String(p.landlord) : '',
      listing_type:    p.listing_type    || '',
      bedrooms:        p.bedrooms        != null ? String(p.bedrooms)  : '',
      bathrooms:       p.bathrooms       != null ? String(p.bathrooms) : '',
      property_type:   p.property_type   || '',
      tenure:          p.tenure          || '',
      status:          p.status          || 'available',
      is_vacant:       !!p.is_vacant,
      available_from:  p.available_from  || '',
      town:            p.town            || '',
      postcode:        p.postcode        || '',
      description:     p.description || '',
      // key_features comes back as an array — edit it as one feature per line.
      key_features:    Array.isArray(p.key_features) ? p.key_features.join('\n') : '',
    });
    setFormErrors({});
    // The property record already carries its images — no need for a
    // separate fetch (which wasn't reliably returning data anyway).
    setImages(Array.isArray(p.images) ? p.images : []);
    setPendingImages([]);
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingItem(null); setImages([]); setPendingImages([]); };

  const handleImageDelete = async (imageId) => {
    if (!window.confirm('Remove this image?')) return;
    try {
      const res = await authFetch(`${BASE_URL}/properties/property-images/${imageId}/`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) throw new Error(`Delete failed (${res.status})`);
      setImages(prev => prev.filter(img => img.id !== imageId));
      if (editingItem) {
        authFetch(`${BASE_URL}/properties/properties/${editingItem.id}/`)
          .then(r => r.ok ? r.json() : null)
          .then(updated => { if (updated) setProperties(prev => prev.map(p => p.id === updated.id ? updated : p)); })
          .catch(() => {});
      }
    } catch (err) {
      showError(err.message);
    }
  };

  // Add a photo to the "not saved yet" queue while creating a new property.
  const handlePendingImageAdd = (e) => {
    const file = e.target.files?.[0];
    if (file) setPendingImages(prev => [...prev, file]);
    e.target.value = '';
  };

  const handlePendingImageRemove = (index) => {
    setPendingImages(prev => prev.filter((_, i) => i !== index));
  };

  // Shared by both the "upload to an existing property" and
  // "upload queued images right after creation" flows.
  const uploadImageFile = async (propertyId, file) => {
  const body = new FormData();
  body.append('images', file);

  // Get the token the same way authFetch does
  const token = localStorage.getItem('access_token');

  const res = await fetch(`${BASE_URL}/properties/properties/${propertyId}/images/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // DO NOT put Content-Type here
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Upload failed:', res.status, text);
    throw new Error(`Upload failed (${res.status}): ${text}`);
  }

  return res.json().catch(() => null);
};
  
  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));
  const setChecked = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.checked }));
  const setAddress = (val) => setForm(prev => ({ ...prev, address: val }));
  const handleAddressSelectDetails = ({ postcode, town }) => {
    setForm(prev => ({
      ...prev,
      postcode: postcode || prev.postcode,
      town: town || prev.town,
    }));
  };

  const buildBody = () => ({
    name:            form.name,
    address:         form.address,
    rent_amount:     form.rent_amount     || null,
    landlord:        form.landlord  ? Number(form.landlord)  : null,
    listing_type:    form.listing_type || '',
    bedrooms:        form.bedrooms  !== '' ? Number(form.bedrooms)  : null,
    bathrooms:       form.bathrooms !== '' ? Number(form.bathrooms) : null,
    property_type:   form.property_type || null,
    tenure:          form.tenure         || null,
    status:          form.status         || 'available',
    is_vacant:       form.is_vacant,
    available_from:  form.available_from || null,
    town:            form.town     || null,
    postcode:        form.postcode || null,
    description:     form.description || '',
    key_features: form.key_features
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean),
  });

  const handleSubmit = () => {
    setFormErrors({});
    setSubmitting(true);
    const url    = editingItem ? `${BASE_URL}/properties/properties/${editingItem.id}/` : `${BASE_URL}/properties/properties/`;
    // PATCH (not PUT) for edits: this form no longer sends every field the
    // backend has (manager, rate fields, etc.), and PUT would overwrite
    // those with nulls since they'd be missing from the body.
    const method = editingItem ? 'PATCH' : 'POST';
    const body = buildBody();
    console.log('[Property] submitting', method, url, body);

    authFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(parseResponse)
      .then(async (result) => {
        console.log('[Property] submit succeeded', result);
        setProperties(prev =>
          editingItem
            ? prev.map(p => p.id === result.id ? result : p)
            : [...prev, result]
        );

        // Any newly queued photos — for a new property or added while
        // editing — upload now that we definitely have an id, rather than
        // as soon as they're picked.
        if (pendingImages.length > 0) {
          const outcomes = await Promise.allSettled(
            pendingImages.map((file) => uploadImageFile(result.id, file))
          );
          const failed = outcomes.filter((o) => o.status === 'rejected').length;
          if (failed > 0) {
            outcomes.forEach((o) => { if (o.status === 'rejected') console.error('[Property] image upload failed', o.reason); });
            showError(`Property saved, but ${failed} of ${pendingImages.length} photo(s) failed to upload.`);
          }
        }

        showSuccess(editingItem ? 'Property updated successfully' : 'Property created successfully');
        closeModal();
      })
      .catch(err => {
        console.error('[Property] submit failed', err.data || err.message);
        showError(err.message);
        if (err.data && typeof err.data === 'object') setFormErrors(err.data);
        else setFormErrors({ general: err.message });
      })
      .finally(() => setSubmitting(false));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this property?')) return;
    authFetch(`${BASE_URL}/properties/properties/${id}/`, { method: 'DELETE' })
      .then(parseResponse)
      .then(() => {
        showSuccess('Property deleted successfully');
        setProperties(prev => prev.filter(p => p.id !== id));
      })
      .catch(err => { showError(err.message); });
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Landlords no longer have a top-level `name` — build a display name from members' contacts.
  const landlordName = (id) => {
    const ll = landlords.find(l => l.id === id);
    if (!ll) return id != null ? `#${id}` : '—';
    const names = (ll.members || [])
      .map(m => [m.contact?.first_name, m.contact?.last_name].filter(Boolean).join(' '))
      .filter(Boolean);
    return names.join(' & ') || `Landlord #${ll.id}`;
  };

  const managerName = (id) => {
    const m = managers.find(u => u.id === id);
    if (!m) return id != null ? `#${id}` : '—';
    return [m.first_name, m.last_name].filter(Boolean).join(' ') || m.username;
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-500">
      <svg className="animate-spin h-6 w-6 mr-3 text-primaryGreen" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Loading properties...
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center py-20 text-red-500">
      ⚠️ Failed to load properties: {error}
    </div>
  );

  const landlordOptions  = landlords.map(l => ({ value: String(l.id), label: landlordName(l.id) }));
  const listingOptions = LISTING_TYPE_OPTIONS;

  return (
    <div>
      <PageHeader title="Property" buttonLabel="Add Property" onButtonClick={openAdd} />

      {properties.length === 0 ? (
        <div className="bg-white border rounded-lg py-16 text-center text-gray-400">
          No properties found
        </div>
      ) : (
        <AdminTable columns={[
          'S/N', 'ID', 'Property Name', 'Address', 'Landlord',
          'Manager', 'Type', 'Beds/Baths', 'Rent Amount', 'Mgmt Rate', 'Status', 'Created At', 'Action',
        ]}>
          {properties.map((p, i) => (
            <AdminTr key={p.id}>
              <AdminTd>{i + 1}</AdminTd>
              <AdminTd>{p.id}</AdminTd>

              <AdminTd>
                <span className="text-primaryGreen font-medium cursor-pointer hover:underline"
                  onClick={() => navigate(`/admin/property/${p.id}`)}>
                  {p.name}
                </span>
              </AdminTd>

              <AdminTd>{p.address || '—'}</AdminTd>
              <AdminTd>{landlordName(p.landlord)}</AdminTd>
              <AdminTd>{managerName(p.manager)}</AdminTd>
              <AdminTd>{listingTypeLabel(p.listing_type)}</AdminTd>
              <AdminTd>{p.bedrooms ?? '—'} bed / {p.bathrooms ?? '—'} bath</AdminTd>
              <AdminTd>{p.rent_amount ? `£${p.rent_amount}` : '—'}</AdminTd>
              <AdminTd>{p.management_rate ? `${p.management_rate}%` : '—'}</AdminTd>
              <AdminTd>{statusLabel(p.status)}</AdminTd>
              <AdminTd>{fmtDate(p.created_at)}</AdminTd>

              <AdminTd>
                <ActionButtons onEdit={() => openEdit(p)} onDelete={() => handleDelete(p.id)} />
              </AdminTd>
            </AdminTr>
          ))}
        </AdminTable>
      )}

      {showModal && (
        <Modal onClose={closeModal}>
          {formErrors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded mb-4">
              {formErrors.general}
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <FormInput label="Property Name:" placeholder="Enter property name" value={form.name} onChange={set('name')} error={formErrors.name?.[0]} />
            <FormInput label="Rent Amount:" placeholder="e.g. 1500.00" value={form.rent_amount} onChange={set('rent_amount')} error={formErrors.rent_amount?.[0]} />
            <div className="col-span-2">
              <GoogleAddressInput
                label="Address:"
                value={form.address}
                onChange={setAddress}
                onSelectDetails={handleAddressSelectDetails}
                error={formErrors.address?.[0]}
              />
            </div>
            <FormSelect
              label="Landlord:"
              placeholder="Select Landlord"
              value={form.landlord}
              onChange={set('landlord')}
              options={landlordOptions}
              error={formErrors.landlord?.[0]}
            />
            <FormSelect
              label="Listing Type:"
              placeholder="Select listing"
              value={form.listing_type}
              onChange={set('listing_type')}
              options={listingOptions}
              error={formErrors.listing_type?.[0]}
            />
            <FormSelect
              label="Property Type:"
              placeholder="Select property type"
              value={form.property_type}
              onChange={set('property_type')}
              options={PROPERTY_TYPE_OPTIONS}
              error={formErrors.property_type?.[0]}
            />
            <FormSelect
              label="Tenure:"
              placeholder="Select tenure"
              value={form.tenure}
              onChange={set('tenure')}
              options={TENURE_OPTIONS}
              error={formErrors.tenure?.[0]}
            />
            <FormSelect
              label="Status:"
              value={form.status}
              onChange={set('status')}
              options={STATUS_OPTIONS}
              error={formErrors.status?.[0]}
            />
            <FormInput label="Bedrooms:" type="number" min="0" placeholder="e.g. 3" value={form.bedrooms} onChange={set('bedrooms')} error={formErrors.bedrooms?.[0]} />
            <FormInput label="Bathrooms:" type="number" min="0" placeholder="e.g. 2" value={form.bathrooms} onChange={set('bathrooms')} error={formErrors.bathrooms?.[0]} />
            <FormInput label="Town:" placeholder="e.g. Cardiff" value={form.town} onChange={set('town')} error={formErrors.town?.[0]} />
            <FormInput label="Postcode:" placeholder="e.g. CF10 1AA" value={form.postcode} onChange={set('postcode')} error={formErrors.postcode?.[0]} />
            <FormInput label="Available From:" type="date" value={form.available_from} onChange={set('available_from')} error={formErrors.available_from?.[0]} />

            <div className="flex items-center gap-2 pt-7">
              <input
                id="is_vacant"
                type="checkbox"
                checked={form.is_vacant}
                onChange={setChecked('is_vacant')}
                className="h-4 w-4 rounded border-primaryGreen text-primaryGreen focus:ring-primaryGreen"
              />
              <label htmlFor="is_vacant" className="text-sm font-medium text-gray-800">Currently vacant</label>
            </div>

            <div className="col-span-2">
              <FormTextarea
                label="Description:"
                placeholder="Full marketing description of the property"
                value={form.description}
                onChange={set('description')}
                rows={4}
              />
            </div>
            <div className="col-span-2">
              <FormTextarea
                label="Key Features (one per line):"
                placeholder={'Private garden\nOff-road parking\nEPC rating C'}
                value={form.key_features}
                onChange={set('key_features')}
                rows={4}
              />
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-gray-800 mb-2">Photos:</p>
            <p className="text-xs text-gray-400 mb-2">
              New photos are uploaded when you hit Save below.
            </p>

            {images.length === 0 && pendingImages.length === 0 && (
              <p className="text-sm text-gray-400 mb-3">No photos yet.</p>
            )}

            {(images.length > 0 || pendingImages.length > 0) && (
              <div className="grid grid-cols-4 gap-3 mb-3">
                {images.map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.image}
                      alt={img.caption || ''}
                      className="w-full h-20 object-cover rounded-md border border-gray-200"
                    />
                    {img.is_primary && (
                      <span className="absolute top-1 left-1 bg-primaryGreen text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                        Primary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleImageDelete(img.id)}
                      className="absolute top-1 right-1 bg-white/90 text-red-600 text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {pendingImages.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-20 object-cover rounded-md border border-gray-200 opacity-80"
                    />
                    <span className="absolute bottom-1 left-1 bg-gray-900/70 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                      New
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePendingImageRemove(index)}
                      className="absolute top-1 right-1 bg-white/90 text-red-600 text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <FormFilePicker label="Add Image:" accept="image/*" onChange={handlePendingImageAdd} />
          </div>

          <ModalActions onCancel={closeModal} onSubmit={handleSubmit} loading={submitting} submitLabel={editingItem ? 'Save Changes' : 'Create Property'} />
        </Modal>
      )}
    </div>
  );
};

export default Property;
