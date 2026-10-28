import { useState, useEffect } from 'react'

const API = 'http://localhost:5000/api'

function App() {
  const [page, setPage] = useState('students')
  const [students, setStudents] = useState([])
  const [payments, setPayments] = useState([])

  const emptyStudent = { studentId: '', name: '', className: '', contact: '', totalFee: '' }
  const emptyPayment = { paymentId: '', studentId: '', feeType: '', amount: '', paymentDate: '' }

  const [studentForm, setStudentForm] = useState(emptyStudent)
  const [editId, setEditId] = useState(null)
  const [paymentForm, setPaymentForm] = useState(emptyPayment)

  // ---------- Load data ----------
  const loadStudents = async () => {
    const res = await fetch(`${API}/students`)
    setStudents(await res.json())
  }

  const loadPayments = async () => {
    const res = await fetch(`${API}/payments`)
    setPayments(await res.json())
  }

  useEffect(() => {
    loadStudents()
    loadPayments()
  }, [])

  // ---------- Students ----------
  const handleStudentChange = (e) =>
    setStudentForm({ ...studentForm, [e.target.name]: e.target.value })

  const saveStudent = async (e) => {
    e.preventDefault()
    const url = editId ? `${API}/students/${editId}` : `${API}/students`
    const method = editId ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentForm),
    })
    const data = await res.json()
    if (!res.ok) return alert(data.message)

    setStudentForm(emptyStudent)
    setEditId(null)
    loadStudents()
  }

  const editStudent = (s) => {
    setEditId(s._id)
    setStudentForm({
      studentId: s.studentId,
      name: s.name,
      className: s.className,
      contact: s.contact,
      totalFee: s.totalFee,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditId(null)
    setStudentForm(emptyStudent)
  }

  const deleteStudent = async (id) => {
    if (!window.confirm('Delete this student and all their payments?')) return
    await fetch(`${API}/students/${id}`, { method: 'DELETE' })
    loadStudents()
    loadPayments()
  }

  // ---------- Payments ----------
  const handlePaymentChange = (e) =>
    setPaymentForm({ ...paymentForm, [e.target.name]: e.target.value })

  const savePayment = async (e) => {
    e.preventDefault()
    const res = await fetch(`${API}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentForm),
    })
    const data = await res.json()
    if (!res.ok) return alert(data.message)

    setPaymentForm(emptyPayment)
    loadPayments()
  }

  const deletePayment = async (id) => {
    if (!window.confirm('Delete this payment?')) return
    await fetch(`${API}/payments/${id}`, { method: 'DELETE' })
    loadPayments()
  }

  // ---------- Helpers ----------
  const getPaid = (studentId) =>
    payments
      .filter((p) => p.studentId === studentId)
      .reduce((sum, p) => sum + p.amount, 0)

  const getName = (studentId) =>
    students.find((s) => s.studentId === studentId)?.name || '-'

  // ---------- UI ----------
  return (
    <div className="min-vh-100 bg-warning-subtle">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-success shadow-sm">
        <div className="container py-2">
          <span className="navbar-brand fs-4 mb-0">🏫 School Fee Management System</span>
        </div>
      </nav>

      <div className="container py-4">
        {/* Tabs */}
        <div className="mb-4 bg-white p-3 rounded shadow-sm">
          <button
            className={`btn me-2 ${page === 'students' ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => setPage('students')}>
            Students
          </button>
          <button
            className={`btn me-2 ${page === 'payments' ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => setPage('payments')}>
            Payments
          </button>
          <button
            className={`btn ${page === 'pending' ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => setPage('pending')}>
            Pending Fees
          </button>
        </div>

        {/* ================= STUDENTS PAGE ================= */}
        {page === 'students' && (
          <>
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white fw-bold py-3">
                {editId ? '✏️ Update Student Details' : '➕ Add Student Details'}
              </div>
              <div className="card-body p-4">
                <form className="row g-3" onSubmit={saveStudent}>
                  <div className="col-md-4">
                    <label className="form-label">Student ID</label>
                    <input className="form-control" name="studentId" placeholder="e.g. S001"
                      value={studentForm.studentId} onChange={handleStudentChange}
                      disabled={editId !== null} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Name</label>
                    <input className="form-control" name="name" placeholder="Student name"
                      value={studentForm.name} onChange={handleStudentChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Class</label>
                    <input className="form-control" name="className" placeholder="e.g. 10A"
                      value={studentForm.className} onChange={handleStudentChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Contact Number</label>
                    <input className="form-control" name="contact" placeholder="10-digit number"
                      value={studentForm.contact} onChange={handleStudentChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Total Fee (₹)</label>
                    <input type="number" className="form-control" name="totalFee" placeholder="e.g. 20000"
                      value={studentForm.totalFee} onChange={handleStudentChange} required />
                  </div>
                  <div className="col-md-4 d-flex align-items-end">
                    <button className="btn btn-success me-2" type="submit">
                      {editId ? 'Update Student' : 'Add Student'}
                    </button>
                    {editId && (
                      <button className="btn btn-outline-secondary" type="button" onClick={cancelEdit}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            <div className="card shadow-sm border-0">
              <div className="card-header bg-white fw-bold py-3">
                All Students ({students.length})
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Student ID</th>
                      <th>Name</th>
                      <th>Class</th>
                      <th>Contact</th>
                      <th>Total Fee</th>
                      <th className="text-end pe-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">
                          No students added yet
                        </td>
                      </tr>
                    )}
                    {students.map((s) => (
                      <tr key={s._id}>
                        <td className="ps-4">{s.studentId}</td>
                        <td>{s.name}</td>
                        <td>{s.className}</td>
                        <td>{s.contact}</td>
                        <td>₹{s.totalFee}</td>
                        <td className="text-end pe-4">
                          <button className="btn btn-sm btn-warning me-2" onClick={() => editStudent(s)}>
                            Edit
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => deleteStudent(s._id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ================= PAYMENTS PAGE ================= */}
        {page === 'payments' && (
          <>
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white fw-bold py-3">💰 Record Fee Payment</div>
              <div className="card-body p-4">
                <form className="row g-3" onSubmit={savePayment}>
                  <div className="col-md-4">
                    <label className="form-label">Payment ID</label>
                    <input className="form-control" name="paymentId" placeholder="e.g. P001"
                      value={paymentForm.paymentId} onChange={handlePaymentChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Student</label>
                    <select className="form-select" name="studentId"
                      value={paymentForm.studentId} onChange={handlePaymentChange} required>
                      <option value="">Select Student</option>
                      {students.map((s) => (
                        <option key={s._id} value={s.studentId}>
                          {s.studentId} - {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Fee Type</label>
                    <input className="form-control" name="feeType" placeholder="Tuition, Exam, Bus..."
                      value={paymentForm.feeType} onChange={handlePaymentChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Amount (₹)</label>
                    <input type="number" className="form-control" name="amount" placeholder="e.g. 5000"
                      value={paymentForm.amount} onChange={handlePaymentChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Payment Date</label>
                    <input type="date" className="form-control" name="paymentDate"
                      value={paymentForm.paymentDate} onChange={handlePaymentChange} required />
                  </div>
                  <div className="col-md-4 d-flex align-items-end">
                    <button className="btn btn-success" type="submit">Record Payment</button>
                  </div>
                </form>
              </div>
            </div>

            <div className="card shadow-sm border-0">
              <div className="card-header bg-white fw-bold py-3">
                Payment History ({payments.length})
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Payment ID</th>
                      <th>Student ID</th>
                      <th>Name</th>
                      <th>Fee Type</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th className="text-end pe-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-4">
                          No payments recorded yet
                        </td>
                      </tr>
                    )}
                    {payments.map((p) => (
                      <tr key={p._id}>
                        <td className="ps-4">{p.paymentId}</td>
                        <td>{p.studentId}</td>
                        <td>{getName(p.studentId)}</td>
                        <td>{p.feeType}</td>
                        <td>₹{p.amount}</td>
                        <td>{p.paymentDate.split('T')[0]}</td>
                        <td className="text-end pe-4">
                          <button className="btn btn-sm btn-danger" onClick={() => deletePayment(p._id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ================= PENDING FEES PAGE ================= */}
        {page === 'pending' && (
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white fw-bold py-3">Pending Fees</div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Student ID</th>
                    <th>Name</th>
                    <th>Class</th>
                    <th>Total Fee</th>
                    <th>Paid</th>
                    <th>Pending</th>
                    <th className="pe-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-4">
                        No students found
                      </td>
                    </tr>
                  )}
                  {students.map((s) => {
                    const paid = getPaid(s.studentId)
                    const pending = s.totalFee - paid
                    return (
                      <tr key={s._id}>
                        <td className="ps-4">{s.studentId}</td>
                        <td>{s.name}</td>
                        <td>{s.className}</td>
                        <td>₹{s.totalFee}</td>
                        <td>₹{paid}</td>
                        <td className="fw-bold">₹{pending}</td>
                        <td className="pe-4">
                          {pending <= 0 ? (
                            <span className="badge bg-success">Cleared</span>
                          ) : paid > 0 ? (
                            <span className="badge bg-warning text-dark">Partial</span>
                          ) : (
                            <span className="badge bg-danger">Unpaid</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App