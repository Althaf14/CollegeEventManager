import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import SkeletonProfile from '../components/SkeletonProfile';
import toast from 'react-hot-toast';

const ProfilePage = () => {
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        department: '',
        phone: '',
        bio: '',
        profileImage: '',
    });
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/profile/me');
            setProfile(data);
            setFormData({
                name: data.name || '',
                department: data.department || '',
                phone: data.phone || '',
                bio: data.bio || '',
                profileImage: data.profileImage || '',
            });
        } catch (err) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        setUploading(true);
        const loadingToast = toast.loading('Uploading image...');

        try {
            const { data } = await api.post('/profile/image', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setProfile((prev) => ({ ...prev, profileImage: data.profileImage }));
            setFormData((prev) => ({ ...prev, profileImage: data.profileImage }));
            toast.success('Image updated!', { id: loadingToast });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed', { id: loadingToast });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const loadingToast = toast.loading('Saving changes...');

        try {
            const { data } = await api.put('/profile/me', formData);
            setProfile(data);
            setIsEditing(false);
            toast.success('Profile updated successfully', { id: loadingToast });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed', { id: loadingToast });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <SkeletonProfile />;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
                {/* Header / Cover */}
                <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>

                <div className="px-8 pb-8">
                    {/* Profile Image */}
                    <div className="relative -mt-16 mb-6 flex justify-between items-end">
                        <div className="relative group">
                            <img
                                src={profile.profileImage || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"}
                                alt="Profile"
                                className={`w-32 h-32 rounded-full border-4 border-gray-800 object-cover bg-gray-700 transition-opacity ${uploading ? 'opacity-50' : 'opacity-100'}`}
                                onError={(e) => {
                                    e.target.src = "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";
                                }}
                            />
                            {/* Image Upload Overlay */}
                            {isEditing && (
                                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-sm font-semibold">Change</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                </label>
                            )}
                        </div>

                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            name: profile.name,
                                            department: profile.department || '',
                                            phone: profile.phone || '',
                                            bio: profile.bio || '',
                                            profileImage: profile.profileImage
                                        });
                                    }}
                                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Info Section */}
                    {!isEditing ? (
                        <div className="space-y-4 animate-fade-in">
                            <div>
                                <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded bg-opacity-60 border border-blue-800 uppercase font-semibold">
                                        {profile.role}
                                    </span>
                                    {profile.department && (
                                        <span className="text-gray-400 text-sm">
                                            | {profile.department}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div className="bg-gray-700 bg-opacity-40 p-4 rounded-lg border border-gray-600">
                                    <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-1">Email</h3>
                                    <p className="text-white font-medium">{profile.email}</p>
                                </div>

                                <div className="bg-gray-700 bg-opacity-40 p-4 rounded-lg border border-gray-600">
                                    <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-1">Phone</h3>
                                    <p className={`font-medium ${profile.phone ? 'text-white' : 'text-gray-500 italic'}`}>
                                        {profile.phone || 'Not provided'}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-700 bg-opacity-40 p-4 rounded-lg border border-gray-600">
                                <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-1">Bio</h3>
                                <p className={`whitespace-pre-line ${profile.bio ? 'text-gray-300' : 'text-gray-500 italic'}`}>
                                    {profile.bio || 'No bio provided yet.'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                    required
                                    disabled={saving}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Department</label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                        disabled={saving}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Phone (10-15 digits)</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                        disabled={saving}
                                        placeholder="e.g. 1234567890"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Bio (Max 200 chars)</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    maxLength={200}
                                    rows="4"
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                    disabled={saving}
                                    placeholder="Tell us about yourself..."
                                ></textarea>
                                <p className="text-right text-xs text-gray-500 mt-1">
                                    {formData.bio.length}/200
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
