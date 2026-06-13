import { Route } from 'react-router-dom';
import Profile from '../feature/Profile/Profile';
import EditProfile from '../feature/Profile/editProfile';

export function profileRoutes() {
  console.log(EditProfile);
  return (
    <>
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/edit" element={<EditProfile />} />
      <Route
        path="edit"
        element={<h1 style={{ color: 'red' }}>EDIT TEST</h1>}
      />
    </>
  );
}
