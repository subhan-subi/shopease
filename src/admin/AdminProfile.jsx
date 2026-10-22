import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { 
  auth, 
  onAuthStateChanged, 
  updateProfile as updateProfileApi, 
  changePassword 
} from "../services/authService";

export function AdminProfile() {
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    image: "",
    role: ""
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      toast.success("Password Updated");

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateProfileApi({
        fullName: profile.fullName,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        image: profile.image
      });

      toast.success("Profile Updated");
    } catch (error) {
      console.log(error);
      toast.error("Update failed");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      if (!user) return;
      setProfile({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        image: user.image || "",
        role: user.role || ""
      });
    });

    return () => unsubscribe();
  }, []);

  if (!profile.fullName) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "60vh", gap: "12px" }}>
        <div
          className="spinner-border"
          role="status"
          style={{ color: "var(--admin-accent)", width: "36px", height: "36px", borderWidth: "3px" }}
        ></div>
        <span style={{ color: "var(--admin-muted)", fontSize: "0.875rem", fontWeight: 500 }}>Loading Profile...</span>
      </div>
    );
  }

  async function uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "admin_profile");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/wzzvrku7/image/upload",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await res.json();
    return data.secure_url;
  }

  async function handleImage(e) {
    const file = e.target.files[0];

    if (!file) return;

    try {
      setUploading(true);

      const url = await uploadImage(file);

      setProfile((prev) => ({
        ...prev,
        image: url
      }));

      // save image in backend
      await updateProfileApi({
        image: url
      });

      toast.success("Image uploaded");
    } catch (error) {
      console.log(error);
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  const initials = profile.fullName
    ? profile.fullName.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase()
    : "AU";

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* Hero Header */}
      <div className="admin-profile-hero mb-4">
        <div className="admin-profile-avatar-wrap">
          {profile.image ? (
            <img
              src={profile.image}
              alt={profile.fullName}
              className="admin-profile-avatar"
            />
          ) : (
            <div
              className="admin-profile-avatar d-flex align-items-center justify-content-center"
              style={{
                background: "linear-gradient(135deg, rgba(255,107,0,0.3) 0%, rgba(255,140,0,0.2) 100%)",
                fontSize: "2rem",
                fontWeight: 800,
                color: "#ffb380",
                letterSpacing: "-1px",
              }}
            >
              {initials}
            </div>
          )}

          <label
            htmlFor="profileImage"
            className="admin-profile-camera-btn"
            title="Change Photo"
          >
            {uploading ? (
              <span className="spinner-border spinner-border-sm" style={{ color: "#fff", width: "14px", height: "14px" }}></span>
            ) : (
              <i className="bi bi-camera-fill"></i>
            )}
          </label>
        </div>

        <input
          type="file"
          id="profileImage"
          accept="image/*"
          hidden
          onChange={handleImage}
        />

        <h2 className="admin-profile-name">{profile.fullName}</h2>

        {profile.role && (
          <span className="admin-profile-role-badge">
            <i className="bi bi-shield-check-fill"></i>
            {profile.role}
          </span>
        )}

        <div className="d-flex justify-content-center gap-4 mt-3" style={{ position: "relative", zIndex: 1 }}>
          {profile.email && (
            <div className="text-center">
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>Email</div>
              <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{profile.email}</div>
            </div>
          )}
          {profile.city && (
            <div className="text-center">
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>City</div>
              <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{profile.city}</div>
            </div>
          )}
          {profile.phone && (
            <div className="text-center">
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>Phone</div>
              <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{profile.phone}</div>
            </div>
          )}
        </div>
      </div>

      <div className="row g-4">
        {/* Personal Details Form */}
        <div className="col-lg-7">
          <div className="admin-card h-100">
            <div
              className="d-flex align-items-center gap-2 px-4 py-3"
              style={{ borderBottom: "1px solid var(--admin-border)" }}
            >
              <div
                style={{
                  width: "32px", height: "32px", borderRadius: "8px",
                  background: "rgba(255,107,0,0.10)", color: "var(--admin-accent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <i className="bi bi-person-gear" style={{ fontSize: "0.9rem" }}></i>
              </div>
              <h5 style={{ margin: 0, fontWeight: 700, color: "var(--admin-text)", fontSize: "0.95rem" }}>
                Personal Details
              </h5>
            </div>

            <div className="p-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="admin-label">Full Name</label>
                  <input
                    type="text"
                    className="admin-input form-control"
                    value={profile.fullName}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        fullName: e.target.value
                      })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="admin-label">Email Address</label>
                  <input
                    type="email"
                    className="admin-input form-control"
                    value={profile.email}
                    disabled
                    style={{ opacity: 0.6, cursor: "not-allowed" }}
                  />
                </div>

                <div className="col-md-6">
                  <label className="admin-label">Phone</label>
                  <input
                    type="text"
                    className="admin-input form-control"
                    placeholder="Enter Phone Number"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        phone: e.target.value
                      })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="admin-label">City</label>
                  <input
                    type="text"
                    className="admin-input form-control"
                    value={profile.city}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        city: e.target.value
                      })
                    }
                  />
                </div>

                <div className="col-12">
                  <label className="admin-label">Address</label>
                  <input
                    type="text"
                    className="admin-input form-control"
                    value={profile.address}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        address: e.target.value
                      })
                    }
                  />
                </div>
              </div>

              <div className="mt-4">
                <button
                  className="admin-btn-primary btn w-100"
                  onClick={handleUpdate}
                  style={{ padding: "12px 20px", fontSize: "0.9rem", justifyContent: "center" }}
                >
                  <i className="bi bi-check-circle-fill"></i>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security / Password Change */}
        <div className="col-lg-5">
          <div className="admin-card h-100">
            <div
              className="d-flex align-items-center gap-2 px-4 py-3"
              style={{ borderBottom: "1px solid var(--admin-border)" }}
            >
              <div
                style={{
                  width: "32px", height: "32px", borderRadius: "8px",
                  background: "rgba(245,158,11,0.10)", color: "#F59E0B",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <i className="bi bi-lock-fill" style={{ fontSize: "0.9rem" }}></i>
              </div>
              <h5 style={{ margin: 0, fontWeight: 700, color: "var(--admin-text)", fontSize: "0.95rem" }}>
                Change Password
              </h5>
            </div>

            <div className="p-4 d-flex flex-column" style={{ height: "calc(100% - 60px)" }}>
              <div className="d-flex flex-column gap-3 flex-grow-1">
                <div>
                  <label className="admin-label">Current Password</label>
                  <input
                    type="password"
                    className="admin-input form-control"
                    placeholder="Enter current password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value
                      })
                    }
                  />
                </div>

                <div>
                  <label className="admin-label">New Password</label>
                  <input
                    type="password"
                    className="admin-input form-control"
                    placeholder="Enter new password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value
                      })
                    }
                  />
                </div>

                <div>
                  <label className="admin-label">Confirm Password</label>
                  <input
                    type="password"
                    className="admin-input form-control"
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value
                      })
                    }
                  />
                </div>
              </div>

              <div className="mt-4">
                <button
                  className="btn w-100 fw-600"
                  onClick={handlePasswordChange}
                  style={{
                    background: "#F59E0B",
                    border: "none",
                    color: "#fff",
                    borderRadius: "8px",
                    padding: "12px 20px",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.22s ease",
                    boxShadow: "0 2px 8px rgba(245,158,11,0.30)",
                  }}
                >
                  <i className="bi bi-key-fill"></i>
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}