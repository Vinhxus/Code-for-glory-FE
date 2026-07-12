import { Route } from 'react-router-dom';
import Profile from '../feature/Profile/Profile';
import EditProfile from '../feature/Profile/editProfile';

export function profileRoutes() {
  return (
    <>
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/edit" element={<EditProfile />} />
    </>
  );
}
