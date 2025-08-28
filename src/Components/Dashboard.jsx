"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { signOut, onAuthStateChanged } from "firebase/auth"
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from "firebase/firestore"
import { auth, db } from "./Firebase"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../Styles/Dashboard.css"
import { FileIcon, defaultStyles } from "react-file-icon"
import { FiSearch, FiUploadCloud, FiGrid, FiList, FiLogOut, FiBell, FiUser, FiSliders, FiCloud, FiFolder } from "react-icons/fi"

export default function Dashboard() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const profileRef = useRef(null)

  const [user, setUser] = useState(null)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0) // Track upload progress
  const [viewMode, setViewMode] = useState("grid")
  const [searchText, setSearchText] = useState("")
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u)
        loadFiles(u.uid)
      } else {
        navigate("/login")
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const onDocClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  const loadFiles = async (userId) => {
    try {
      const q = query(collection(db, "files"), where("userId", "==", userId))
      const querySnapshot = await getDocs(q)
      const files = []
      querySnapshot.forEach((d) => {
        files.push({ id: d.id, ...d.data() })
      })
      setUploadedFiles(files)
    } catch (error) {
      toast.error("Failed to load files: " + error.message)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast.success("Logged out successfully 👋")
      navigate("/login")
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error(`File ${file.name} is too large (max 10MB)`)
      return
    }

    setUploading(true)
    setProgress(0) // Reset progress

    try {
      // Upload file to Cloudinary with progress tracking
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", "FireDrive")
      formData.append("folder", `files/${user.uid}`)

      const xhr = new XMLHttpRequest()
      xhr.open("POST", `https://api.cloudinary.com/v1_1/drqbmfqk6/auto/upload`, true)

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100)
          setProgress(percent)
        }
      }

      // Handle upload completion
      const response = await new Promise((resolve, reject) => {
        xhr.onload = () => resolve(xhr)
        xhr.onerror = () => reject(new Error("Upload failed"))
        xhr.send(formData)
      })

      if (response.status !== 200) {
        throw new Error("Failed to upload file to Cloudinary")
      }

      const data = JSON.parse(response.responseText)
      if (!data.secure_url) {
        throw new Error("Upload to Cloudinary failed")
      }

      // Save file metadata to Firestore
      const fileData = {
        name: file.name,
        url: data.secure_url,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        userId: user.uid,
        publicId: data.public_id,
      }

      const docRef = await addDoc(collection(db, "files"), fileData)
      setUploadedFiles((prev) => [...prev, { id: docRef.id, ...fileData }])
      toast.success(`Uploaded ${file.name}`)
      e.target.value = ""
    } catch (error) {
      toast.error("Upload failed: " + error.message)
      console.error("Upload error:", error)
    } finally {
      setUploading(false)
      setProgress(0) // Reset progress after completion
    }
  }

  const handleCreateFolder = async () => {
    if (!user) return
    const name = window.prompt("Folder name")
    if (!name || !name.trim()) return
    try {
      const folderData = {
        name: name.trim(),
        isFolder: true,
        itemsCount: 0,
        uploadedAt: new Date().toISOString(),
        userId: user.uid,
        type: "folder",
      }
      const docRef = await addDoc(collection(db, "files"), folderData)
      setUploadedFiles((prev) => [...prev, { id: docRef.id, ...folderData }])
      toast.success(`Folder "${name}" created`)
    } catch (error) {
      toast.error("Failed to create folder: " + error.message)
    }
  }

  const handleDelete = async (file) => {
    try {
      await deleteDoc(doc(db, "files", file.id))
      setUploadedFiles((prev) => prev.filter((f) => f.id !== file.id))
      toast.success(`Deleted ${file.name}`)
    } catch (error) {
      toast.error("Failed to delete: " + error.message)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const totalUsedBytes = useMemo(
    () => uploadedFiles.reduce((sum, f) => sum + (f.size || 0), 0),
    [uploadedFiles]
  )
  const storageLimitBytes = 15 * 1024 * 1024 * 1024
  const usedPercent = Math.min(100, Math.round((totalUsedBytes / storageLimitBytes) * 100))

  const filteredFiles = useMemo(() => {
    if (!searchText) return uploadedFiles
    const s = searchText.toLowerCase()
    return uploadedFiles.filter((f) => f.name?.toLowerCase().includes(s))
  }, [uploadedFiles, searchText])

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User"
  const avatarLetter = displayName?.[0]?.toUpperCase?.() || "U"

  return (
    <div className="dashboard-container">
      {/* Top Bar with centered rectangular search box */}
      <div className="topnav grid">
        <div className="brand"><FiCloud className="cloud" /> FireDrive</div>

        <div className="top-search">
          <FiSearch className="icon" />
          <input
            type="text"
            placeholder="Search in FireDrive"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div className="right" ref={profileRef}>
          <button className="icon-btn" title="Notifications"><FiBell /></button>
          <button
            className="avatar-btn"
            title="Account"
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen((v) => !v)}
          >
            <span className="avatar-circle">{avatarLetter}</span>
          </button>

          {profileOpen && (
            <div className="profile-menu">
              <div className="profile-header">
                <span className="avatar-circle lg">{avatarLetter}</span>
                <div className="profile-info">
                  <div className="name">{displayName}</div>
                  <div className="email">{user?.email}</div>
                </div>
              </div>
              <div className="profile-actions">
                <button className="logout-row" onClick={handleLogout}>
                  <FiLogOut /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <aside className="sidebar">
        <button
          className="fab"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={
            uploading
              ? {
                  background: `linear-gradient(to right, #ff8c00 ${progress}%, #ffd3c3 ${progress}%)`,
                }
              : {}
          }
        >
          {uploading ? `${progress}%` : "Upload"}
        </button>

        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

        <nav className="sidebar-nav">
          <button className="active-item">My Drive</button>
          <button>Shared with me</button>
          <button>Recent</button>
          <button>Starred</button>
          <button>Trash</button>
        </nav>

        <div className="storage">
          <div className="storage-bar">
            <div className="storage-used" style={{ width: `${usedPercent}%` }} />
          </div>
          <div className="storage-info">{formatFileSize(totalUsedBytes)} of 15 GB used</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="content">
        <div className="section-toolbar">
          <h1>My Drive</h1>
          <div className="tools">
            <button className="btn-secondary" onClick={handleCreateFolder}>+ New Folder</button>
            <button className="icon-btn" title="Filters"><FiSliders /></button>
            <div className="view-toggle">
              <button onClick={() => setViewMode("list")} className={viewMode === "list" ? "active" : ""} aria-label="List view"><FiList /></button>
              <button onClick={() => setViewMode("grid")} className={viewMode === "grid" ? "active" : ""} aria-label="Grid view"><FiGrid /></button>
            </div>
          </div>
        </div>

        <div className={`file-list-box ${viewMode}`}>
          <div className="list-header"><span className="count">{filteredFiles.length} items</span></div>

          {filteredFiles.length > 0 ? (
            <div className={`file-container ${viewMode}`}>
              {filteredFiles.map((file) => (
                <div key={file.id} className="file-card">
                  <div className="file-icon">
                    {file.isFolder || file.type === "folder" ? (
                      <FiFolder className="folder-icon" />
                    ) : (
                      <FileIcon extension={file.type} {...(defaultStyles[file.type] || {})} />
                    )}
                  </div>
                  <div className="file-info">
                    {file.isFolder || file.type === "folder" ? (
                      <span className="folder-name">{file.name}</span>
                    ) : (
                      <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
                    )}
                    <p>
                      {file.isFolder || file.type === "folder"
                        ? `${file.itemsCount || 0} items`
                        : formatFileSize(file.size)}
                      {` • ${new Date(file.uploadedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <button className="delete" onClick={() => handleDelete(file)}>Delete</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty">No files uploaded yet.</p>
          )}
        </div>
      </main>
    </div>
  )
}
