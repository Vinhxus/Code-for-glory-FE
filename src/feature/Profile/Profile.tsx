import './Profile.css';
import { useNavigate } from 'react-router-dom';

const skillsData = {
  frontend: {
    title: 'FRONTEND ARCANIST',
    skills: [
      {
        name: 'UI Architecture',
        percent: 92,
        tags: ['REACT', 'VITE.JS', 'FRAMER'],
      },
      { name: 'Performance Ops', percent: 78, tags: ['VITE', 'LIGHTHOUSE'] },
    ],
  },
  backend: {
    title: 'BACKEND SORCERER',
    skills: [
      { name: 'API Alchemy', percent: 84, tags: ['NODE.JS', 'REST', 'SQL'] },
      { name: 'System Resonance', percent: 45, tags: ['DOCKER', 'AWS'] },
    ],
  },
};

const courses = [
  { type: 'FE', title: 'Tailwind Animation Mastery', progress: 65 },
  { type: 'BE', title: 'Redis Caching Strategies', progress: 20 },
];

const achievements = [
  { icon: '⚡', title: 'Pro Frontend', sub: 'LEVEL 13 ARCHMAGE' },
  { icon: '🛡️', title: 'System Guardian', sub: '300+ CODE REVIEWS' },
  { icon: '🔥', title: 'Fire Starter', sub: '30 DAY STREAK' },
];

function SkillBar({
  name,
  percent,
  tags,
}: {
  name: string;
  percent: number;
  tags: string[];
}) {
  return (
    <div className="skill-item">
      <div className="skill-header">
        <span className="skill-name">{name}</span>
        <span className="skill-percent">{percent}%</span>
      </div>
      <div className="skill-track">
        <div className="skill-fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="skill-tags">
        {tags.map((t) => (
          <span key={t} className="skill-tag">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function Profile() {
  const navigate = useNavigate();
  const handleEditClick = () => {
    navigate('/profile/edit');
  };

  return (
    <div className="page">
      <button className="btn-back" onClick={() => navigate(-1)} title="Go back">
        {' '}
        ←{' '}
      </button>
      <div className="row row-top">
        <div className="card card-profile">
          <div className="avatar-wrap">
            <div className="avatar-ring" />
            <div className="avatar-inner" />
          </div>
          <div className="profile-info">
            <h2 className="username">User</h2>
            <p className="user-sub">beginner</p>
            <div className="profile-stats">
              <div>
                <span className="stat-val">12.5k</span>
                <span className="stat-label">Followers</span>
              </div>
              <div>
                <span className="stat-val">482</span>
                <span className="stat-label">Following</span>
              </div>
            </div>
          </div>
          <button className="btn-edit" onClick={handleEditClick}>
            ✏ Edit profile
          </button>
        </div>

        <div className="card card-rank">
          <h3 className="rank-title">Rank</h3>
          <div className="rank-cols">
            <div className="rank-col">
              <span className="rank-label">BE</span>
              <div className="rank-badge rank-badge--empty" />
            </div>
            <div className="rank-col">
              <span className="rank-label">FE</span>
              <div className="rank-badge rank-badge--empty" />
            </div>
          </div>
        </div>
      </div>

      <div className="card card-stats">
        {[
          { label: 'Level', value: '42', accent: false },
          { label: 'Problems Solved', value: '156', accent: false },
          { label: 'Streak', value: '12', accent: false },
          { label: 'Highest Rank', value: 'ARCHMAGE', accent: true },
        ].map((s) => (
          <div key={s.label} className="stat-block">
            <span className="stat-block-label">{s.label}</span>
            <span
              className={`stat-block-val${s.accent ? ' stat-block-val--gold' : ''}`}
            >
              {s.value}
            </span>
          </div>
        ))}
      </div>

      <div className="row row-courses">
        {courses.map((c) => (
          <div key={c.title} className="card card-course">
            <span className="course-type"> Current lesson {c.type}</span>
            <h4 className="course-title">{c.title}</h4>
            <div className="course-footer">
              <span className="course-progress-label">
                Progress: {c.progress}%
              </span>
              <button className="btn-continue">CONTINUE →</button>
            </div>
            <div className="course-bar-track">
              <div
                className="course-bar-fill"
                style={{ width: `${c.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/*skills*/}
      <div className="card card-skills">
        <h3 className="section-title">⚡ Skills Progress Comparison</h3>
        <div className="skills-grid">
          {Object.values(skillsData).map((side) => (
            <div key={side.title} className="skills-side">
              <span className="skills-side-title">{side.title}</span>
              {side.skills.map((sk) => (
                <SkillBar key={sk.name} {...sk} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="card card-achievements">
        <h3 className="section-title">🏆 Recent Achievements</h3>
        <div className="achievements-grid">
          {achievements.map((a) => (
            <div key={a.title} className="achievement-card">
              <div className="achievement-icon">{a.icon}</div>
              <div>
                <p className="achievement-title">{a.title}</p>
                <p className="achievement-sub">{a.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profile;
