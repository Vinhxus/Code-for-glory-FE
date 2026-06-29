import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './editProfile.css';

/* ── Types ── */
interface Skill {
  id: number;
  name: string;
  percent: number;
  tags: string[];
  side: 'frontend' | 'backend';
}

interface ProfileData {
  username: string;
  role: string;
  bio: string;
  location: string;
  email: string;
}

interface PrivacyToggles {
  showProfile: boolean;
  showCertificates: boolean;
}

/* ── Initial state (mirrors Profile data) ── */
const INITIAL_PROFILE: ProfileData = {
  username: 'User',
  role: 'beginner',
  bio: '',
  location: '',
  email: '',
};

const INITIAL_PRIVACY: PrivacyToggles = {
  showProfile: true,
  showCertificates: true,
};

const INITIAL_SKILLS: Skill[] = [
  {
    id: 1,
    side: 'frontend',
    name: 'UI Architecture',
    percent: 92,
    tags: ['REACT', 'VITE.JS', 'FRAMER'],
  },
  {
    id: 2,
    side: 'frontend',
    name: 'Performance Ops',
    percent: 78,
    tags: ['VITE', 'LIGHTHOUSE'],
  },
  {
    id: 3,
    side: 'backend',
    name: 'API Alchemy',
    percent: 84,
    tags: ['NODE.JS', 'REST', 'SQL'],
  },
  {
    id: 4,
    side: 'backend',
    name: 'System Resonance',
    percent: 45,
    tags: ['DOCKER', 'AWS'],
  },
];

const ROLE_OPTIONS = [
  'beginner',
  'apprentice',
  'journeyman',
  'expert',
  'archmage',
];

/* ── Skill row component ── */
function SkillEditRow({
  skill,
  onChange,
}: {
  skill: Skill;
  onChange: (updated: Skill) => void;
}) {
  const [tagInput, setTagInput] = useState('');

  const handleTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toUpperCase();
      if (!skill.tags.includes(newTag)) {
        onChange({ ...skill, tags: [...skill.tags, newTag] });
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) =>
    onChange({ ...skill, tags: skill.tags.filter((t) => t !== tag) });

  return (
    <div className="skill-edit-item">
      <div className="skill-edit-header">
        <span className="skill-edit-type">
          {skill.side === 'frontend' ? '⚡ FE' : '🔩 BE'}
        </span>
        <input
          className="skill-edit-name"
          value={skill.name}
          onChange={(e) => onChange({ ...skill, name: e.target.value })}
          placeholder="Skill name"
        />
        <span className="skill-edit-percent">{skill.percent}%</span>
      </div>

      {/* Progress slider with visual fill */}
      <div style={{ position: 'relative' }}>
        <div className="skill-range-track">
          <div
            className="skill-range-fill"
            style={{ width: `${skill.percent}%` }}
          />
        </div>
        <input
          type="range"
          className="skill-range"
          min={0}
          max={100}
          value={skill.percent}
          onChange={(e) =>
            onChange({ ...skill, percent: Number(e.target.value) })
          }
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            opacity: 0,
            height: '100%',
            cursor: 'pointer',
            zIndex: 1,
          }}
        />
      </div>

      {/* Tags */}
      <div className="skill-edit-tags">
        {skill.tags.map((tag) => (
          <span key={tag} className="skill-tag-edit">
            {tag}
            <button className="skill-tag-remove" onClick={() => removeTag(tag)}>
              ✕
            </button>
          </span>
        ))}
        <input
          className="skill-tag-add-input"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKey}
          placeholder="+ Add tag"
          maxLength={12}
        />
      </div>
    </div>
  );
}

/* ── Main component ── */
export default function EditProfile() {
  console.log('EditProfile rendered');
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [skills, setSkills] = useState<Skill[]>(INITIAL_SKILLS);
  const [privacy, setPrivacy] = useState<PrivacyToggles>(INITIAL_PRIVACY);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [bioLen, setBioLen] = useState(0);

  const MAX_BIO = 160;

  /* Handlers */
  const handleField = useCallback(
    (key: keyof ProfileData) =>
      (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      ) => {
        const val = e.target.value;
        setProfile((prev) => ({ ...prev, [key]: val }));
        if (key === 'bio') setBioLen(val.length);
      },
    []
  );

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarSrc(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSkillChange = (updated: Skill) =>
    setSkills((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));

  const handleSave = () => {
    // In a real app: dispatch to store / call API
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      navigate('/profile');
    }, 1800);
  };

  const counterClass =
    bioLen > MAX_BIO
      ? 'field-counter field-counter--over'
      : bioLen > MAX_BIO - 20
        ? 'field-counter field-counter--warn'
        : 'field-counter';

  return (
    <div className="edit-page">
      {/* ─── Top bar ─── */}
      <div className="edit-topbar">
        <div className="edit-topbar-left">
          <button
            className="btn-back"
            onClick={() => navigate(-1)}
            title="Go back"
          >
            ←
          </button>
          <span className="edit-topbar-title">Edit Profile</span>
        </div>
      </div>

      <div className="edit-card">
        <p className="edit-section-title">Avatar</p>
        <div className="edit-avatar-section">
          <div className="edit-avatar-wrap">
            <div className="edit-avatar-ring" />
            <div
              className="edit-avatar-img"
              style={
                avatarSrc
                  ? {
                      backgroundImage: `url(${avatarSrc})`,
                      backgroundSize: 'cover',
                    }
                  : {}
              }
            >
              {!avatarSrc && '👤'}
            </div>
            <div
              className="edit-avatar-overlay"
              onClick={() => fileInputRef.current?.click()}
            >
              📷
            </div>
          </div>

          <div className="edit-avatar-info">
            <p className="edit-avatar-label">Profile picture</p>
            <p className="edit-avatar-hint">
              PNG or JPG · max 2 MB · will be cropped to circle
            </p>
            <div className="edit-avatar-btns">
              <button
                className="btn-upload"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload image
              </button>
              {avatarSrc && (
                <button
                  className="btn-remove-avatar"
                  onClick={() => setAvatarSrc(null)}
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarUpload}
          />
        </div>
      </div>

      {/* ─── Basic info ─── */}
      <div className="edit-card">
        <p className="edit-section-title">Basic info</p>

        <div className="edit-form-grid">
          <div className="field">
            <label className="field-label">Username</label>
            <input
              className="field-input"
              value={profile.username}
              onChange={handleField('username')}
              placeholder="e.g. archmage_dev"
              maxLength={32}
            />
          </div>

          <div className="field">
            <label className="field-label">Role / Title</label>
            <select
              className="field-select"
              value={profile.role}
              onChange={handleField('role')}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field edit-form-grid--full">
          <label className="field-label">
            Bio
            <span className={counterClass} style={{ float: 'right' }}>
              {bioLen} / {MAX_BIO}
            </span>
          </label>
          <textarea
            className="field-textarea"
            value={profile.bio}
            onChange={handleField('bio')}
            placeholder="A short intro — what you're building, learning, or obsessing over."
            maxLength={MAX_BIO}
          />
        </div>

        <div className="edit-form-grid">
          <div className="field">
            <label className="field-label">Location</label>
            <input
              className="field-input"
              value={profile.location}
              onChange={handleField('location')}
              placeholder="e.g. Ho Chi Minh City"
            />
          </div>
          <div className="field">
            <label className="field-label">Email</label>
            <input
              className="field-input"
              value={profile.email}
              onChange={handleField('email')}
              placeholder="you@example.com"
              type="email"
            />
          </div>
        </div>
      </div>

      <div className="edit-card">
        <p className="edit-section-title">Privacy</p>
        <div className="privacy-list">
          {(
            [
              {
                key: 'showProfile',
                label: 'Show profile',
                desc: 'Make your profile visible to other users',
              },
              {
                key: 'showCertificates',
                label: 'Show Certificates in Profile',
                desc: 'Display earned certificates on your profile page',
              },
            ] as const
          ).map(({ key, label, desc }) => (
            <div key={key} className="privacy-row">
              <div className="privacy-text">
                <span className="privacy-label">{label}</span>
                <span className="privacy-desc">{desc}</span>
              </div>
              <button
                role="switch"
                aria-checked={privacy[key]}
                className={`toggle${privacy[key] ? ' toggle--on' : ''}`}
                onClick={() =>
                  setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }))
                }
              >
                <span className="toggle-thumb" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Skills ─── */}
      <div className="edit-card">
        <p className="edit-section-title">
          Skills — drag sliders to adjust · press Enter to add tags
        </p>
        <div className="skills-edit-list">
          {skills.map((skill) => (
            <SkillEditRow
              key={skill.id}
              skill={skill}
              onChange={handleSkillChange}
            />
          ))}
        </div>
      </div>

      {/* ─── Danger zone ─── */}
      <div className="edit-card">
        <p className="edit-section-title">Danger zone</p>
        <div className="edit-danger-zone">
          <div className="danger-info">
            <span className="danger-title">Delete account</span>
            <span className="danger-desc">
              Permanently removes all your data. This cannot be undone.
            </span>
          </div>
          <button className="btn-danger">Delete account</button>
        </div>
      </div>

      {/* ─── Bottom save shortcut ─── */}
      <div className="edit-bottom-actions">
        <button className="btn-cancel" onClick={() => navigate(-1)}>
          Cancel
        </button>
        <button className="btn-save" onClick={handleSave}>
          Save changes
        </button>
      </div>

      {/* ─── Toast ─── */}
      <div className={`edit-toast${showToast ? ' show' : ''}`}>
        ✓ Profile saved
      </div>
    </div>
  );
}
