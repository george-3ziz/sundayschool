document.addEventListener("DOMContentLoaded", () => {
  const welcomeScreen = document.getElementById("welcomeScreen");
  const startBtn = document.getElementById("startBtn");
  const classPage = document.getElementById("classPage");
  const studentSection = document.getElementById("studentSection");
  const classList = document.getElementById("classList");
  const classModal = new bootstrap.Modal(document.getElementById("addClassModal"));
  const studentModal = new bootstrap.Modal(document.getElementById("addStudentModal"));
  const confirmModal = new bootstrap.Modal(document.getElementById("confirmModal"));
  const passwordModal = new bootstrap.Modal(document.getElementById("passwordModal"));
  const saveClassBtn = document.getElementById("saveClassBtn");
  const classNameInput = document.getElementById("classNameInput");
  const confirmMessage = document.getElementById("confirmMessage");
  const confirmYes = document.getElementById("confirmYes");
  const addStudentBtn = document.getElementById("addStudentBtn");
  const saveStudentBtn = document.getElementById("saveStudentBtn");
  const studentTableBody = document.getElementById("studentTableBody");
  const backToClasses = document.getElementById("backToClasses");
  const classTitle = document.getElementById("classTitle");
  const addClassBtn = document.getElementById("addClassBtn");
  const searchClassInput = document.getElementById("searchClassInput");
  const searchStudentInput = document.getElementById("searchStudentInput");
  const downloadPdfBtn = document.getElementById("downloadPdfBtn");
  const passwordInput = document.getElementById("passwordInput");
  const submitPasswordBtn = document.getElementById("submitPasswordBtn");
  const passwordError = document.getElementById("passwordError");

  let classes = JSON.parse(localStorage.getItem("classes")) || {};
  let currentClass = "";
  let editMode = null;

  const saveToStorage = () => localStorage.setItem("classes", JSON.stringify(classes));

  function showConfirm(message, onConfirm) {
    confirmMessage.textContent = message;
    confirmYes.onclick = () => {
      onConfirm();
      confirmModal.hide();
    };
    confirmModal.show();
  }

  startBtn.addEventListener("click", () => {
    if (localStorage.getItem("passwordEntered") === "true") {
      welcomeScreen.style.display = "none";
      classPage.style.display = "block";
      loadClasses();
    } else {
      passwordModal.show();
    }
  });

  submitPasswordBtn.addEventListener("click", () => {
    if (passwordInput.value === "George111") {
      localStorage.setItem("passwordEntered", "true");
      passwordModal.hide();
      welcomeScreen.style.display = "none";
      classPage.style.display = "block";
      loadClasses();
    } else {
      passwordError.classList.remove("d-none");
    }
  });

  passwordInput.addEventListener("input", () => {
    passwordError.classList.add("d-none");
  });

  searchClassInput.addEventListener("input", loadClasses);
  searchStudentInput.addEventListener("input", renderStudents);

  downloadPdfBtn.addEventListener("click", () => {
    const table = document.querySelector(".table");
    html2canvas(table, { allowTaint: true, useCORS: true, scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jspdf.jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      let width = pdfWidth;
      let height = width / ratio;
      if (height > pdfHeight) {
        height = pdfHeight;
        width = height * ratio;
      }
      const x = (pdfWidth - width) / 2;
      const y = (pdfHeight - height) / 2;
      pdf.addImage(imgData, 'PNG', x, y, width, height);
      pdf.save(`${currentClass}.pdf`);
    });
  });

  function loadClasses() {
    const searchTerm = searchClassInput.value.toLowerCase();
    classList.innerHTML = "";
    Object.keys(classes)
      .filter(name => name.toLowerCase().includes(searchTerm))
      .forEach(name => {
        const div = document.createElement("div");
        div.className = "col-sm-6 col-md-4 col-lg-3";
        div.innerHTML = `
          <div class="class-card">
            <div class="d-flex justify-content-between align-items-center">
              <span class="class-name">${name}</span>
              <div>
                <button class="btn btn-warning btn-sm me-1 edit-class"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-danger btn-sm delete-class"><i class="bi bi-trash"></i></button>
              </div>
            </div>
          </div>`;
        
        div.querySelector(".edit-class").addEventListener("click", (e) => {
          e.stopPropagation();
          classNameInput.value = name;
          editMode = name;
          classModal.show();
        });

        div.querySelector(".delete-class").addEventListener("click", (e) => {
          e.stopPropagation();
          showConfirm(`هل تريد حذف الفصل \"${name}\".؟`, () => {
            delete classes[name];
            saveToStorage();
            loadClasses();
          });
        });

        div.querySelector(".class-card").addEventListener("click", (e) => {
          if (!e.target.closest("button")) openClass(name);
        });

        classList.appendChild(div);
      });
  }

  addClassBtn.addEventListener("click", () => {
    classNameInput.value = "";
    editMode = null;
    classModal.show();
  });

  saveClassBtn.addEventListener("click", () => {
    const name = classNameInput.value.trim();
    if (!name) return alert("من فضلك أدخل اسم الفصل");

    if (editMode) {
      if (editMode !== name && classes[name]) return alert("⚠️ اسم الفصل الجديد موجود بالفعل");
      classes[name] = classes[editMode];
      if (editMode !== name) delete classes[editMode];
      editMode = null;
    } else {
      if (classes[name]) return alert("⚠️ الفصل موجود بالفعل");
      classes[name] = [];
    }

    saveToStorage();
    loadClasses();
    classModal.hide();
  });

  function openClass(name) {
    currentClass = name;
    classTitle.textContent = `👨‍🏫 ${name}`;
    classPage.style.display = "none";
    studentSection.style.display = "block";
    renderStudents();
  }

  backToClasses.addEventListener("click", () => {
    studentSection.style.display = "none";
    classPage.style.display = "block";
  });

  addStudentBtn.addEventListener("click", () => {
    document.getElementById("studentName").value = "";
    document.getElementById("studentAddress").value = "";
    document.getElementById("studentPhone").value = "";
    editMode = null;
    studentModal.show();
  });

  saveStudentBtn.addEventListener("click", () => {
 
    const name = document.getElementById("studentName").value.trim();

    const studentClassInput = document.getElementById("studentClass").value.trim();

    const address = document.getElementById("studentAddress").value.trim();

    const phone = document.getElementById("studentPhone").value.trim();

    if (!name) return alert("من فضلك أدخل اسم الطالب");

    if (!classes[currentClass]) classes[currentClass] = [];

   if (editMode !== null && typeof editMode === "number") {
  classes[currentClass][editMode] = { ...classes[currentClass][editMode], name, class: studentClassInput, address, phone };
  editMode = null;
} else {
  classes[currentClass].push({ name, class: studentClassInput, address, phone, attendance: {} });
}
    saveToStorage();
    studentModal.hide();
    renderStudents();
  });

  function renderStudents() {
    const searchTerm = searchStudentInput.value.toLowerCase();
    studentTableBody.innerHTML = "";

    if (!classes[currentClass]) classes[currentClass] = [];

    classes[currentClass]
      .filter(s => s.name.toLowerCase().includes(searchTerm))
      .forEach((s, i) => {
        if (!s.attendance) s.attendance = {};
        const presentCount = Object.values(s.attendance).filter(status => status === 'present').length;
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td class="sticky-col fw-bolder">${i + 1}</td>
          <td>${s.name}</td>
          <td>${s.class || ""}</td>
          <td>${s.address}</td>
          <td>${s.phone}</td>
          <td><button class="btn btn-primary btn-sm"><i class="bi bi-check2-circle"></i></button></td>
          <td><button class="btn btn-danger btn-sm"><i class="bi bi-x-circle"></i></button></td>
          <td class="attendance-cells"></td>
          <td>${presentCount}</td>
          <td>
            <button class="btn btn-warning btn-sm me-1"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-outline-danger btn-sm"><i class="bi bi-trash3"></i></button>
          </td>
        `;

        const presentBtn = tr.children[5].querySelector("button");
        const absentBtn = tr.children[6].querySelector("button");
        const attendanceCell = tr.querySelector(".attendance-cells");
        const editBtn = tr.children[9].children[0];
        const deleteBtn = tr.children[9].children[1];
  attendanceCell.innerHTML = "";
  Object.keys(s.attendance).forEach(date => {
    const box = document.createElement("div");
    box.style.background = s.attendance[date] === "present" ? "blue" :
                           s.attendance[date] === "absent" ? "red" : "gray";
    const datePart = date.split("_")[0];
    box.textContent = datePart;
    box.style.display = "inline-block";
    box.style.width = "30px";
    box.style.height = "30px";
    box.style.color = "white";
    box.style.borderRadius = "50%";
    box.style.margin = "3px";
    box.style.fontSize = "11px";
    box.style.textAlign = "center";
    box.style.lineHeight = "30px";
    box.style.cursor = "pointer";
    box.title = "اضغط لحذف هذا السجل";

    // ✅ حذف الغياب أو الحضور عند الضغط على الدائرة
    box.addEventListener("click", () => {
      showConfirm("هل تريد حذف هذا السجل (" + datePart + ")؟", () => {
        delete s.attendance[date];
        saveToStorage();
        renderStudents();
      });
    });

    attendanceCell.appendChild(box);
  });


        // ✅ تسجيل الحضور أكتر من مرة في نفس اليوم
        presentBtn.addEventListener("click", () => {
          const now = new Date();
          const dateKey = `${now.getDate()}/${now.getMonth() + 1}`;
          const timeKey = `${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
          const fullKey = `${dateKey}_${timeKey}`;
          s.attendance[fullKey] = "present";
          saveToStorage();
          renderStudents();
        });

        // ✅ تسجيل الغياب أكتر من مرة في نفس اليوم
        absentBtn.addEventListener("click", () => {
          const now = new Date();
          const dateKey = `${now.getDate()}/${now.getMonth() + 1}`;
          const timeKey = `${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
          const fullKey = `${dateKey}_${timeKey}`;
          s.attendance[fullKey] = "absent";
          saveToStorage();
          renderStudents();
        });

        editBtn.addEventListener("click", () => {
          document.getElementById("studentName").value = s.name;
          document.getElementById("studentAddress").value = s.address;
          document.getElementById("studentPhone").value = s.phone;
          editMode = i;
          studentModal.show();
        });

        deleteBtn.addEventListener("click", () => {
          showConfirm("هل تريد حذف هذا الطالب؟", () => {
            classes[currentClass].splice(i, 1);
            saveToStorage();
            renderStudents();
          });
        });

        studentTableBody.appendChild(tr);
      });
  }

  // Check if password is entered on initial load
  if (localStorage.getItem("passwordEntered") === "true") {
    welcomeScreen.style.display = "none";
    classPage.style.display = "block";
    loadClasses();
  }
});