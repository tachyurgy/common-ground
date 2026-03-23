import { NavLink } from 'react-router-dom';

interface SidebarProps {
  agreementId?: number;
}

export default function Sidebar({ agreementId }: SidebarProps) {
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <NavLink to="/">Common Ground</NavLink>
      </div>

      <div className="sidebar-section">
        <h3>About</h3>
        <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>
          What Is This?
        </NavLink>
        <NavLink to="/story" className={({ isActive }) => isActive ? 'active' : ''}>
          The Story
        </NavLink>
        <NavLink to="/tech" className={({ isActive }) => isActive ? 'active' : ''}>
          Tech Stack
        </NavLink>
      </div>

      <div className="sidebar-section">
        <h3>Agreement</h3>
        <NavLink to="/new" className={({ isActive }) => isActive ? 'active' : ''}>
          Start New
        </NavLink>
        {agreementId && (
          <>
            <NavLink
              to={`/agreement/${agreementId}`}
              end
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Current Session
            </NavLink>
            <NavLink
              to={`/agreement/${agreementId}/contract`}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              View Contract
            </NavLink>
            <NavLink
              to={`/agreement/${agreementId}/history`}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Version History
            </NavLink>
            <NavLink
              to={`/agreement/${agreementId}/responses`}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              All Responses
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
