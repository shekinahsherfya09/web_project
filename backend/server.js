const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()
app.use(cors())
app.use(express.json())

// ---------- Connect to MongoDB ----------
mongoose
  .connect('mongodb://127.0.0.1:27017/school_fee_db')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB error:', err.message))

// ---------- Schemas / Models ----------
const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  className: { type: String, required: true },
  contact: { type: String, required: true },
  totalFee: { type: Number, required: true },
})
const Student = mongoose.model('Student', studentSchema)

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  feeType: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, required: true },
})
const Payment = mongoose.model('Payment', paymentSchema)

// ================= STUDENT APIs =================

// View all students
app.get('/api/students', async (req, res) => {
  const students = await Student.find()
  res.json(students)
})

// Add student
app.post('/api/students', async (req, res) => {
  try {
    const student = await Student.create(req.body)
    res.status(201).json(student)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Student ID already exists' })
    }
    res.status(400).json({ message: err.message })
  }
})

// Update student
app.put('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!student) return res.status(404).json({ message: 'Student not found' })
    res.json(student)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Delete student (and their payments)
app.delete('/api/students/:id', async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id)
  if (!student) return res.status(404).json({ message: 'Student not found' })
  await Payment.deleteMany({ studentId: student.studentId })
  res.json({ message: 'Student deleted' })
})

// ================= PAYMENT APIs =================

// View payment history
app.get('/api/payments', async (req, res) => {
  const payments = await Payment.find().sort({ paymentDate: -1 })
  res.json(payments)
})

// Record payment
app.post('/api/payments', async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.body.studentId })
    if (!student) return res.status(404).json({ message: 'Student ID not found' })

    const payment = await Payment.create(req.body)
    res.status(201).json(payment)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Payment ID already exists' })
    }
    res.status(400).json({ message: err.message })
  }
})

// Delete payment
app.delete('/api/payments/:id', async (req, res) => {
  const payment = await Payment.findByIdAndDelete(req.params.id)
  if (!payment) return res.status(404).json({ message: 'Payment not found' })
  res.json({ message: 'Payment deleted' })
})

// ---------- Start server ----------
app.listen(5000, () => console.log('Server running on http://localhost:5000'))