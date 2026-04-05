import { NavLink } from 'react-router-dom';

interface SidebarProps {
  agreementId?: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ agreementId, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <NavLink to="/" onClick={onClose}>Common Ground</NavLink>
        </div>

        <div className="sidebar-section">
          <h3>About</h3>
          <NavLink to="/about" onClick={onClose} className={({ isActive }) => isActive ? 'active' : ''}>
            What Is This?
          </NavLink>
          <NavLink to="/story" onClick={onClose} className={({ isActive }) => isActive ? 'active' : ''}>
            The Story
          </NavLink>
          <NavLink to="/tech" onClick={onClose} className={({ isActive }) => isActive ? 'active' : ''}>
            Tech Stack
          </NavLink>
        </div>

        <div className="sidebar-section">
          <h3>Agreement</h3>
          <NavLink to="/new" onClick={onClose} className={({ isActive }) => isActive ? 'active' : ''}>
            Start New
          </NavLink>
          {agreementId && (
            <>
              <NavLink
                to={`/agreement/${agreementId}`}
                end
                onClick={onClose}
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                Current Session
              </NavLink>
              <NavLink
                to={`/agreement/${agreementId}/contract`}
                onClick={onClose}
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                View Contract
              </NavLink>
              <NavLink
                to={`/agreement/${agreementId}/history`}
                onClick={onClose}
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                Version History
              </NavLink>
              <NavLink
                to={`/agreement/${agreementId}/responses`}
                onClick={onClose}
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                All Responses
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
