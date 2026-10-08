# 🎓 Student Management System

A responsive, frontend-only **Student Management System** built as a college **Web Application Development PBL Micro Project**.
It runs entirely in the browser, stores data in **LocalStorage**, and can be hosted for free on **GitHub Pages**. It works on phones, tablets and desktops.

---

## 📌 Project Description

This Student Management System is a web-based application developed as a college PBL micro project. It provides a simple interface for managing student records including student ID, name, email, phone, course/branch and semester.

There is **no backend, no database server and no build step**. Open `index.html` and it works.

---

## ✨ Features

- 📊 **Dashboard** with live statistics: Total Students, Current Semester, IT Students, Recently Added (last 7 days)
- ⚡ **Quick Actions** to add or view students
- 🕒 **Recent Students**: the latest 5 added records
- ➕ **Add Student** form with inline validation:
  - Student ID: required and unique
  - Name: required, at least 2 characters
  - Email: required, valid format
  - Phone: required, valid 10-digit Indian mobile number (starts with 6–9)
  - Course / Branch and Semester (1–8): required
- 👁️ **View** student details in a modal
- ✏️ **Edit** student details (validated, then saved)
- 🗑️ **Delete** with a confirmation modal
- 🔍 **Instant search** by Student ID, Name, Email or Course, with matches highlighted
- 🎛️ **Filters** by Course and Semester, plus **sorting** (recent, oldest, name, ID, semester)
- 💾 **LocalStorage persistence**, so data stays after a page refresh
- 🔔 **Toast notifications** that disappear automatically
- 📱 **Fully responsive**:
  - Desktop: sidebar and student table
  - Mobile: hamburger menu, student cards, bottom-sheet modals, large touch targets
- ♿ **Accessible**: semantic HTML, labels, ARIA attributes, keyboard support (Esc / Tab focus trap) and visible focus states
- 🧪 Sample students created on first launch only

---

## 🛠️ Technologies Used

| Technology    | Purpose                         |
|---------------|---------------------------------|
| HTML5         | Page structure (semantic markup) |
| CSS3          | Responsive, mobile-first styling |
| JavaScript    | Application logic (vanilla JS)  |
| LocalStorage  | Persistent data in the browser  |

No frameworks, no libraries, no npm.

---

## 📁 Project Structure

```
student-management-system/
│
├── index.html   → Page structure (dashboard, students, form, about, modals)
├── style.css    → All styles and responsive media queries
├── script.js    → App logic (CRUD, LocalStorage, search, validation, toasts)
└── README.md    → Documentation
```

---

## ▶️ How to Run Locally

1. Download or clone this repository.
2. Open the `student-management-system` folder.
3. Double-click **`index.html`** to open it in any modern browser (Chrome, Edge, Firefox, Safari).

You don't need to install anything.

> Optional: if you use VS Code, you can also open it with the **Live Server** extension.

---

## 🌐 How to Deploy Using GitHub Pages

1. **Create a GitHub repository.** Sign in to [github.com](https://github.com), click **New repository**, give it a name (for example `student-management-system`), make it **Public**, and click **Create repository**.
2. **Upload the files.** Click **Add file → Upload files** and upload `index.html`, `style.css`, `script.js` (and `README.md`). Put them in the **root** of the repository, not inside a subfolder. Click **Commit changes**.
3. Open the repository's **Settings** tab.
4. In the left sidebar, open **Pages**.
5. Under **Build and deployment → Source**, choose **Deploy from a branch**, then select the **`main`** branch.
6. Select the **`/ (root)`** folder.
7. Click **Save**.
8. Wait 1–2 minutes, then refresh the Pages settings screen. Open the generated URL:
   `https://<your-username>.github.io/<repository-name>/`

You can open this URL on your mobile phone as well.

---

## 🧹 Removing the Sample Data

Sample students are created **only on first launch** (when the `students` key does not exist in LocalStorage).

To start with an empty system:
1. In `script.js`, set `USE_SAMPLE_DATA` to `false` (section **2. SAMPLE DATA**), **or** delete the `getSampleStudents()` block.
2. Clear the old data in your browser: DevTools → Application → Local Storage → delete the `students` key.

---

## 📝 Notes

- Data is stored **per browser and per device**. Records added on your phone will not appear on your laptop. This is expected for a LocalStorage-based app.
- Clearing browser data removes the saved records.

---

## 👨‍🎓 Project Info

- **Project Type:** PBL Micro Project
- **Subject:** Web Application Development
- **Hosting:** GitHub Pages (static website)
