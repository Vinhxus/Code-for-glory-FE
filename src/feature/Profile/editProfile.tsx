import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../../store/settings';
import {
  getProfileSummary,
  updateProfile,
  type CareerField,
  type SkillLevel,
  type SocialLinks,
} from '../../services/userApi';
import './editProfile.css';

/* ── Form state shape — mirrors UpdateProfilePayload but keeps
   everything as controlled strings for simpler input binding. ── */
interface FormState {
  username: string;
  avatarUrl: string;
  bio: string;
  location: string;
  fieldFocus: CareerField | '';
  selfAssessedLevel: SkillLevel | '';
  socialLinks: SocialLinks;
}

const EMPTY_FORM: FormState = {
  username: '',
  avatarUrl: '',
  bio: '',
  location: '',
  fieldFocus: '',
  selfAssessedLevel: '',
  socialLinks: {},
};

const MAX_BIO = 160;

const SKILL_LEVEL_OPTIONS: SkillLevel[] = [
  'novice',
  'apprentice',
  'journeyman',
  'master',
];

const FIELD_FOCUS_OPTIONS: CareerField[] = ['frontend', 'backend', 'fullstack'];

export default function EditProfile() {
  const navigate = useNavigate();
  const language = useSettingsStore((s) => s.language);
  const isVi = language === 'vi';

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showCertificates: true,
  });
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getProfileSummary()
      .then((data) => {
        if (cancelled) return;
        setForm({
          username: data.username,
          avatarUrl: data.avatarUrl ?? '',
          bio: data.bio ?? '',
          location: data.location ?? '',
          fieldFocus: data.fieldFocus ?? '',
          selfAssessedLevel: data.selfAssessedLevel ?? '',
          socialLinks: data.socialLinks ?? {},
        });
        setEmail(data.email);
        setPrivacy({
          showProfile: data.showProfile,
          showCertificates: data.showCertificates,
        });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(
            err instanceof Error
              ? err.message
              : isVi
                ? 'Không tải được hồ sơ.'
                : 'Failed to load profile.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const setSocialField = useCallback(
    (key: keyof SocialLinks, value: string) => {
      setForm((prev) => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [key]: value },
      }));
    },
    []
  );

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      // Chuỗi rỗng nghĩa là "chưa nhập" — không gửi lên để tránh set field
      // thành '' một cách vô nghĩa (BE validate URL/username sẽ reject '').
      await updateProfile({
        username: form.username.trim() || undefined,
        avatarUrl: form.avatarUrl.trim() || undefined,
        bio: form.bio,
        location: form.location.trim() || undefined,
        fieldFocus: form.fieldFocus || undefined,
        selfAssessedLevel: form.selfAssessedLevel || undefined,
        socialLinks: {
          github: form.socialLinks.github?.trim() || undefined,
          linkedin: form.socialLinks.linkedin?.trim() || undefined,
          twitter: form.socialLinks.twitter?.trim() || undefined,
          website: form.socialLinks.website?.trim() || undefined,
        },
        showProfile: privacy.showProfile,
        showCertificates: privacy.showCertificates,
      });
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        navigate('/profile');
      }, 1400);
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : isVi
            ? 'Lưu thất bại, thử lại sau.'
            : 'Save failed, please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const bioLen = form.bio.length;
  const counterClass =
    bioLen > MAX_BIO
      ? 'field-counter field-counter--over'
      : bioLen > MAX_BIO - 20
        ? 'field-counter field-counter--warn'
        : 'field-counter';

  if (loading) {
    return (
      <div className="edit-page">
        <p
          style={{
            textAlign: 'center',
            padding: '60px 0',
            color: 'var(--cg-text-muted)',
          }}
        >
          {isVi ? 'Đang tải…' : 'Loading…'}
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="edit-page">
        <p
          style={{
            textAlign: 'center',
            padding: '60px 0',
            color: 'var(--cg-coral)',
          }}
        >
          {loadError}
        </p>
      </div>
    );
  }

  return (
    <div className="edit-page">
      {/* ─── Top bar ─── */}
      <div className="edit-topbar">
        <div className="edit-topbar-left">
          <button
            className="btn-back"
            onClick={() => navigate(-1)}
            title={isVi ? 'Quay lại' : 'Go back'}
          >
            ←
          </button>
          <span className="edit-topbar-title">
            {isVi ? 'Chỉnh sửa hồ sơ' : 'Edit Profile'}
          </span>
        </div>
        <div className="edit-topbar-actions">
          <button className="btn-cancel" onClick={() => navigate(-1)}>
            {isVi ? 'Huỷ' : 'Cancel'}
          </button>
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? (isVi ? 'Đang lưu…' : 'Saving…') : isVi ? 'Lưu' : 'Save'}
          </button>
        </div>
      </div>

      {saveError && (
        <div
          className="edit-card"
          style={{ borderColor: 'rgba(255,126,95,0.4)' }}
        >
          <p style={{ color: 'var(--cg-coral)', margin: 0 }}>{saveError}</p>
        </div>
      )}

      {/* ─── Avatar ─── */}
      <div className="edit-card">
        <p className="edit-section-title">{isVi ? 'Ảnh đại diện' : 'Avatar'}</p>
        <div className="edit-avatar-section">
          <div className="edit-avatar-wrap">
            <div className="edit-avatar-ring" />
            <div
              className="edit-avatar-img"
              style={
                form.avatarUrl
                  ? {
                      backgroundImage: `url(${form.avatarUrl})`,
                      backgroundSize: 'cover',
                    }
                  : {}
              }
            >
              {!form.avatarUrl && '👤'}
            </div>
          </div>
          <div className="edit-avatar-info">
            <p className="edit-avatar-label">
              {isVi ? 'URL ảnh đại diện' : 'Avatar image URL'}
            </p>
            <p className="edit-avatar-hint">
              {isVi
                ? 'Chưa có dịch vụ lưu trữ ảnh — dán liên kết ảnh có sẵn (vd. từ GitHub, Imgur).'
                : "No image hosting yet — paste a link to an image you've already uploaded elsewhere (e.g. GitHub, Imgur)."}
            </p>
            <input
              className="field-input"
              value={form.avatarUrl}
              onChange={(e) => setField('avatarUrl', e.target.value)}
              placeholder="https://…"
              style={{ marginTop: 8 }}
            />
          </div>
        </div>
      </div>

      {/* ─── Basic info ─── */}
      <div className="edit-card">
        <p className="edit-section-title">
          {isVi ? 'Thông tin cơ bản' : 'Basic info'}
        </p>

        <div className="edit-form-grid">
          <div className="field">
            <label className="field-label">
              {isVi ? 'Tên người dùng' : 'Username'}
            </label>
            <input
              className="field-input"
              value={form.username}
              onChange={(e) => setField('username', e.target.value)}
              placeholder="e.g. tranminhkhoi_dev"
              maxLength={32}
            />
          </div>

          <div className="field">
            <label className="field-label">Email</label>
            <input
              className="field-input"
              value={email}
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
            <span className="field-hint">
              {isVi
                ? 'Không thể đổi email tại đây.'
                : "Email can't be changed here."}
            </span>
          </div>
        </div>

        <div className="edit-form-grid">
          <div className="field">
            <label className="field-label">
              {isVi ? 'Định hướng' : 'Field focus'}
            </label>
            <select
              className="field-select"
              value={form.fieldFocus}
              onChange={(e) =>
                setField('fieldFocus', e.target.value as CareerField)
              }
            >
              <option value="">{isVi ? '— Chưa chọn —' : '— Not set —'}</option>
              {FIELD_FOCUS_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field-label">
              {isVi ? 'Trình độ' : 'Skill level'}
            </label>
            <select
              className="field-select"
              value={form.selfAssessedLevel}
              onChange={(e) =>
                setField('selfAssessedLevel', e.target.value as SkillLevel)
              }
            >
              <option value="">{isVi ? '— Chưa chọn —' : '— Not set —'}</option>
              {SKILL_LEVEL_OPTIONS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
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
            value={form.bio}
            onChange={(e) => setField('bio', e.target.value)}
            placeholder={
              isVi
                ? 'Vài dòng ngắn — bạn đang xây gì, học gì, mê gì.'
                : "A short intro — what you're building, learning, or obsessing over."
            }
            maxLength={MAX_BIO}
          />
        </div>

        <div className="edit-form-grid">
          <div className="field">
            <label className="field-label">
              {isVi ? 'Địa điểm' : 'Location'}
            </label>
            <input
              className="field-input"
              value={form.location}
              onChange={(e) => setField('location', e.target.value)}
              placeholder="e.g. Ho Chi Minh City"
              maxLength={80}
            />
          </div>
        </div>
      </div>

      {/* ─── Social links ─── */}
      <div className="edit-card">
        <p className="edit-section-title">
          {isVi ? 'Liên kết mạng xã hội' : 'Social links'}
        </p>
        <p className="field-hint" style={{ marginBottom: 4 }}>
          {isVi
            ? 'Lưu ý: để trống một ô sẽ giữ nguyên giá trị đã lưu trước đó, không xoá được qua form này.'
            : 'Note: leaving a field blank keeps its previously saved value — clearing a link is not supported yet.'}
        </p>

        <div className="edit-form-grid">
          <div className="field">
            <label className="field-label">GitHub</label>
            <div className="social-input-row">
              <span className="social-input-prefix">github.com/</span>
              <input
                className="field-input"
                value={form.socialLinks.github ?? ''}
                onChange={(e) => setSocialField('github', e.target.value)}
                placeholder="username"
                maxLength={39}
              />
            </div>
          </div>

          <div className="field">
            <label className="field-label">LinkedIn</label>
            <div className="social-input-row">
              <span className="social-input-prefix">linkedin.com/in/</span>
              <input
                className="field-input"
                value={form.socialLinks.linkedin ?? ''}
                onChange={(e) => setSocialField('linkedin', e.target.value)}
                placeholder="username"
                maxLength={39}
              />
            </div>
          </div>
        </div>

        <div className="edit-form-grid">
          <div className="field">
            <label className="field-label">X (Twitter)</label>
            <div className="social-input-row">
              <span className="social-input-prefix">x.com/</span>
              <input
                className="field-input"
                value={form.socialLinks.twitter ?? ''}
                onChange={(e) => setSocialField('twitter', e.target.value)}
                placeholder="username"
                maxLength={15}
              />
            </div>
          </div>

          <div className="field">
            <label className="field-label">
              {isVi ? 'Website cá nhân' : 'Personal website'}
            </label>
            <input
              className="field-input"
              value={form.socialLinks.website ?? ''}
              onChange={(e) => setSocialField('website', e.target.value)}
              placeholder="https://…"
            />
          </div>
        </div>
      </div>

      {/* ─── Privacy ─── */}
      <div className="edit-card">
        <p className="edit-section-title">
          {isVi ? 'Quyền riêng tư' : 'Privacy'}
        </p>
        <div className="privacy-list">
          {[
            {
              key: 'showProfile' as const,
              label: isVi ? 'Hiển thị hồ sơ' : 'Show profile',
              desc: isVi
                ? 'Cho phép người khác xem hồ sơ của bạn'
                : 'Make your profile visible to other users',
            },
            {
              key: 'showCertificates' as const,
              label: isVi
                ? 'Hiển thị chứng chỉ'
                : 'Show certificates in profile',
              desc: isVi
                ? 'Hiện các chứng chỉ đã đạt được trên trang hồ sơ'
                : 'Display earned certificates on your profile page',
            },
          ].map(({ key, label, desc }) => (
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

      {/* ─── Danger zone ─── */}
      <div className="edit-card">
        <p className="edit-section-title">
          {isVi ? 'Vùng nguy hiểm' : 'Danger zone'}
        </p>
        <div className="edit-danger-zone">
          <div className="danger-info">
            <span className="danger-title">
              {isVi ? 'Xoá tài khoản' : 'Delete account'}
            </span>
            <span className="danger-desc">
              {isVi
                ? 'Tính năng này chưa được hỗ trợ ở backend.'
                : 'This feature is not yet supported by the backend.'}
            </span>
          </div>
          <button
            className="btn-danger"
            disabled
            title={isVi ? 'Chưa khả dụng' : 'Not available yet'}
          >
            {isVi ? 'Xoá tài khoản' : 'Delete account'}
          </button>
        </div>
      </div>

      {/* ─── Bottom save shortcut ─── */}
      <div className="edit-bottom-actions">
        <button className="btn-cancel" onClick={() => navigate(-1)}>
          {isVi ? 'Huỷ' : 'Cancel'}
        </button>
        <button className="btn-save" onClick={handleSave} disabled={saving}>
          {saving
            ? isVi
              ? 'Đang lưu…'
              : 'Saving…'
            : isVi
              ? 'Lưu thay đổi'
              : 'Save changes'}
        </button>
      </div>

      {/* ─── Toast ─── */}
      <div className={`edit-toast${showToast ? ' show' : ''}`}>
        ✓ {isVi ? 'Đã lưu hồ sơ' : 'Profile saved'}
      </div>
    </div>
  );
}
