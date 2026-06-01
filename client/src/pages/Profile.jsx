import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import API from '../utils/axios';
import { PageHeaderSkeleton } from '../components/Skeletons';

const USER_TYPES = ['employee', 'client', 'vendor', 'partner', 'external'];
const WORK_MODES = ['onsite', 'remote', 'hybrid'];
const AVAILABILITY = ['available', 'focused', 'busy', 'away'];
const SKILL_OPTIONS = ['Frontend Development', 'Backend Development', 'UI/UX Design', 'Project Management', 'Marketing', 'Sales', 'Customer Success', 'Data Analysis', 'Operations', 'Finance', 'HR', 'Legal', 'Cybersecurity', 'Product Strategy'];
const COMM_OPTIONS = ['Email', 'Secure messages', 'Video call', 'Async updates', 'Quick sync', 'Project channel'];

const emptyProfile = {
  name: '', email: '', employeeId: '', userType: 'employee', organization: '', department: '', roleTitle: '', profession: '', occupation: '', location: '', workMode: '', availabilityStatus: 'available', bio: '', photo: '',
  skills: [], expertiseAreas: [], interests: [], collaborationGoals: [], communicationPreferences: [],
  privacy: { showPhoto: 'public', showContact: 'connected', showFullName: 'public' },
  verificationDocuments: { nidFront: '', nidBack: '', selfieWithNid: '' },
};

function listFromText(value) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

export default function Profile() {
  const [form, setForm] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const completion = useMemo(() => {
    const fields = ['name', 'organization', 'department', 'roleTitle', 'location', 'bio'];
    const filled = fields.filter((f) => Boolean(form[f])).length + (form.skills.length ? 1 : 0) + (form.communicationPreferences.length ? 1 : 0);
    return Math.round((filled / 8) * 100);
  }, [form]);

  useEffect(() => {
    API.get('/users/me')
      .then(({ data }) => setForm({
        ...emptyProfile,
        ...data,
        privacy: { ...emptyProfile.privacy, ...(data.privacy || {}) },
        verificationDocuments: { ...emptyProfile.verificationDocuments, ...(data.verificationDocuments || {}) },
        skills: data.skills || data.interests || [],
        expertiseAreas: data.expertiseAreas || [],
        collaborationGoals: data.collaborationGoals || [],
        communicationPreferences: data.communicationPreferences || [],
      }))
      .catch(() => toast.error('Professional identity could not be loaded.'))
      .finally(() => setLoading(false));
  }, []);

  const update = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const updatePrivacy = (e) => setForm((prev) => ({ ...prev, privacy: { ...prev.privacy, [e.target.name]: e.target.value } }));
  const updateList = (name, value) => setForm((prev) => ({ ...prev, [name]: listFromText(value) }));
  const toggleList = (name, value) => setForm((prev) => ({ ...prev, [name]: prev[name].includes(value) ? prev[name].filter((x) => x !== value) : [...prev[name], value] }));

  const handleVerificationImage = (field, file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be under 2MB for demo storage.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        verificationDocuments: {
          ...prev.verificationDocuments,
          [field]: reader.result,
        },
      }));
      toast.success('Verification image added.');
    };
    reader.readAsDataURL(file);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await API.put('/users/me', { ...form, interests: form.skills, profileCompletion: completion });
      setForm((prev) => ({ ...prev, ...data, verificationDocuments: { ...prev.verificationDocuments, ...(data.verificationDocuments || {}) } }));
      toast.success('Professional identity workspace saved successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Profile could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const requestVerification = async () => {
    const docs = form.verificationDocuments || {};

    if (!docs.nidFront || !docs.nidBack || !docs.selfieWithNid) {
      toast.error('Upload NID front, NID back, and selfie with NID before requesting verification.');
      return;
    }

    try {
      const { data } = await API.put('/users/verification/submit', {
        note: 'Please review my BondBridge professional identity documents.',
        verificationDocuments: docs,
      });
      setForm((prev) => ({ ...prev, ...data.user, verificationDocuments: { ...prev.verificationDocuments, ...(data.user.verificationDocuments || {}) } }));
      toast.success('Verification request submitted to Trust & Safety.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification request could not be submitted.');
    }
  };

  if (loading) {
    return (
      <main className="page-wrapper container">
        <PageHeaderSkeleton />
        <div className="layout-sidebar">
          <div className="skeleton-card"><div className="skeleton skeleton-avatar" /><div className="skeleton skeleton-line medium" /><div className="skeleton skeleton-line long" /></div>
          <div className="skeleton-card"><div className="skeleton skeleton-line medium" style={{ height: 28 }} /><div className="skeleton skeleton-line long" /><div className="skeleton skeleton-line long" /><div className="skeleton skeleton-line medium" /></div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-wrapper container animate-fade-up">
      <header className="page-header">
        <span className="section-label">Identity workspace</span>
        <h1 className="heading-lg">Professional Identity Workspace</h1>
        <p className="body-md" style={{ maxWidth: 760 }}>Maintain verified work identity, role information, skills, collaboration goals, and communication visibility from one secure workspace.</p>
      </header>

      <div className="layout-sidebar">
        <aside className="card" style={{ padding: 24, position: 'sticky', top: 88 }}>
          <div className="avatar avatar-2xl" style={{ marginBottom: 18 }}>{form.photo ? <img src={form.photo} alt={form.name} /> : (form.name || 'BB').slice(0,2).toUpperCase()}</div>
          <h2 className="heading-sm">{form.name || 'BondBridge Member'}</h2>
          <p className="body-sm">{form.roleTitle || form.profession || 'Professional role not added'}</p>
          <div className="divider" />
          <span className={form.verificationStatus === 'verified' ? 'tag tag-verified' : form.verificationStatus === 'rejected' ? 'tag tag-danger' : 'tag tag-warning'}>{form.verificationStatus || 'unverified'}</span>
          <div style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span className="body-sm">Workspace completion</span><strong>{completion}%</strong></div>
            <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${completion}%` }} /></div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 20 }} onClick={requestVerification} disabled={form.verificationStatus === 'pending' || form.verificationStatus === 'verified'}>Request identity verification</button>
          <p className="body-sm" style={{ marginTop: 12 }}>Upload all three NID images before submitting. For demo storage, each image must be under 2MB.</p>
        </aside>

        <form onSubmit={submit} style={{ display: 'grid', gap: 20 }}>
          <Section title="Core Professional Identity" description="Only include information that supports workplace communication and verified professional networking.">
            <Input name="name" label="Full name" value={form.name} onChange={update} />
            <Input name="employeeId" label="Employee / client ID" value={form.employeeId || ''} onChange={update} />
            <Select name="userType" label="Profile type" value={form.userType} onChange={update} options={USER_TYPES} />
            <Input name="organization" label="Organization" value={form.organization || ''} onChange={update} />
            <Input name="department" label="Department" value={form.department || ''} onChange={update} />
            <Input name="roleTitle" label="Role / title" value={form.roleTitle || ''} onChange={update} />
            <Input name="location" label="Office / region" value={form.location || ''} onChange={update} />
            <Select name="workMode" label="Work mode" value={form.workMode || ''} onChange={update} options={WORK_MODES} />
          </Section>

          <Section title="Skills & Collaboration Context" description="These fields help colleagues and clients find the right person for official collaboration.">
            <TextArea name="bio" label="Professional summary" value={form.bio || ''} onChange={update} placeholder="Briefly describe your work focus, responsibilities, and collaboration style." />
            <TagSelector label="Skills" options={SKILL_OPTIONS} selected={form.skills || []} onToggle={(v) => toggleList('skills', v)} />
            <Input label="Expertise areas" value={(form.expertiseAreas || []).join(', ')} onChange={(e) => updateList('expertiseAreas', e.target.value)} placeholder="Comma separated" />
            <Input label="Collaboration goals" value={(form.collaborationGoals || []).join(', ')} onChange={(e) => updateList('collaborationGoals', e.target.value)} placeholder="Mentoring, client support, project review…" />
          </Section>

          <Section title="Identity Verification Documents" description="These documents are reviewed only by the Trust & Safety admin.">
            <VerificationUploadCard label="NID Front Image" value={form.verificationDocuments?.nidFront} onChange={(file) => handleVerificationImage('nidFront', file)} />
            <VerificationUploadCard label="NID Back Image" value={form.verificationDocuments?.nidBack} onChange={(file) => handleVerificationImage('nidBack', file)} />
            <VerificationUploadCard label="Selfie With NID" value={form.verificationDocuments?.selfieWithNid} onChange={(file) => handleVerificationImage('selfieWithNid', file)} />
          </Section>

          <Section title="Communication Preferences" description="Set how people should approach you for official or casual workplace conversations.">
            <Select name="availabilityStatus" label="Availability status" value={form.availabilityStatus} onChange={update} options={AVAILABILITY} />
            <TagSelector label="Preferred channels" options={COMM_OPTIONS} selected={form.communicationPreferences || []} onToggle={(v) => toggleList('communicationPreferences', v)} />
          </Section>

          <Section title="Visibility Controls" description="Manage what others can see before and after a verified connection is accepted.">
            <Select name="showPhoto" label="Photo visibility" value={form.privacy.showPhoto} onChange={updatePrivacy} options={['public', 'connected', 'verified']} />
            <Select name="showContact" label="Contact visibility" value={form.privacy.showContact} onChange={updatePrivacy} options={['connected', 'hidden']} />
            <Select name="showFullName" label="Name visibility" value={form.privacy.showFullName} onChange={updatePrivacy} options={['public', 'connected']} />
          </Section>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button className="btn btn-secondary" type="button">Cancel</button>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save workspace'}</button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Section({ title, description, children }) {
  return <section className="card" style={{ padding: 24 }}><h2 className="heading-sm">{title}</h2><p className="body-sm" style={{ marginBottom: 18 }}>{description}</p><div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 16 }}>{children}</div></section>;
}
function Input({ label, ...props }) { return <label className="form-group"><span className="form-label">{label}</span><input className="form-input" {...props} /></label>; }
function Select({ label, options, ...props }) { return <label className="form-group"><span className="form-label">{label}</span><select className="form-select" {...props}><option value="">Select</option>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select></label>; }
function TextArea({ label, ...props }) { return <label className="form-group" style={{ gridColumn: '1 / -1' }}><span className="form-label">{label}</span><textarea className="form-textarea" {...props} /></label>; }
function TagSelector({ label, options, selected, onToggle }) { return <div className="form-group" style={{ gridColumn: '1 / -1' }}><span className="form-label">{label}</span><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{options.map((o) => <button type="button" key={o} className={`tag ${selected.includes(o) ? 'tag-accent' : ''}`} onClick={() => onToggle(o)}>{o}</button>)}</div></div>; }

function VerificationUploadCard({ label, value, onChange }) {
  return (
    <div className="verification-upload-card">
      <div className="verification-upload-preview">
        {value ? <img src={value} alt={label} /> : <span>No image selected</span>}
      </div>
      <label className="form-label">{label}</label>
      <input type="file" accept="image/*" className="form-input" onChange={(e) => onChange(e.target.files?.[0])} />
    </div>
  );
}
