import {Router, Request, Response} from "express"
import { StudentRepository } from "../repositories/types/students.base.repository"
import { Student } from "../types/Student"
import logError from "../util/logError"

export function createStudentRouter(repository: StudentRepository){
    const router = Router()

    //Get Students
    router.get("/", async (req: Request, res: Response) => {
        try{
            const students = await repository.getStudents()
            return res.status(200).json(students)
        }catch(err){
            logError("Failed to fetch students", err, req)
            return res.status(500).json({error: "Failed to fetch students"})
        }
    })
    //Get Student by ID
    router.get('/:id', async (req: Request, res: Response) => {
        try{
            const studentId = parseInt(req.params.id)
            const student = await repository.getStudent(studentId)
            return res.status(200).json(student)
            
        }catch(err){
            logError("Error getting student", err, req)
            return res.status(500).json({ error: "Error getting student" })
        }
    })

    //Add Student
    router.post("/", async (req: Request, res: Response) => {
        try{
            let {firstName, lastName, dateOfBirth, gradeLevel} = req.body
            if(!firstName || !lastName || !dateOfBirth || !gradeLevel){
                logError("Error adding student, missing required fields", new Error("Failed to add student"), req)
                return res.status(400).json({error: 'Error creating student, missing required fields'})
            }
            gradeLevel = parseInt(gradeLevel)
            if (isNaN(gradeLevel)) {
                logError("Error adding student, invalid grade level", new Error("Failed to add student"), req)
                return res.status(400).json({ error: "Invalid grade type" })
            }
            const student: Student = {firstName, lastName, dateOfBirth, gradeLevel}
            await repository.addStudent(student)
            return res.status(200).json(student)
            
        }catch(err){
            logError("Error adding student", err, req)
            return res.status(500).json({ error: "Error adding student" })
        }
    })
    
    //Update Student
    router.put("/:id", async (req: Request, res: Response) => {
        try{
            const studentId = parseInt(req.params.id)
            const updatedStudent = req.body
            await repository.updateStudent(studentId, updatedStudent)
            return res.status(200).json(updatedStudent)
        }catch(err){
            logError("Error updating student", err, req)
            return res.status(500).json({error: "Error updating student"})
        }
    })

    //Delete Student
    router.delete("/:id", async (req: Request, res: Response) => {
        try{
            const studentId = parseInt(req.params.id)
            await repository.deleteStudent(studentId)
            return res.status(200).json({message: `Student ${studentId} deleted`})
            
        }catch(err){
            logError("Error deleting student ", err, req)
            return res.status(500).json({ error: "Error deleting student" })
        }
    })

    //Assign Student Guardian
    router.put("/:id/guardian", async (req: Request, res: Response) => {
        try{
            const validRelationships = ["Mother", "Father", "Legal Guardian", "Other"]
            const studentId = parseInt(req.params.id)
            let {guardianId, relationship} = req.body
            if(!guardianId){
                logError("Cannot assign student guardian, guardian ID missing", new Error("Failed to assign guardian"), req)
                return res.status(400).json({error: `Cannot assign student ${studentId}, missing guardian ID`})
            }
            guardianId = parseInt(guardianId)
            if (isNaN(guardianId)) {
                logError("Cannot assign student guardian, guardian ID invalid", new Error("Failed to assign guardian"), req)
                return res.status(400).json({ error: "Invalid student ID" })
            }
            if(!relationship) {
                logError("Cannot assign student Guardian, missing relationship input", new Error("Failed to assign guardian"), req)
                return res.status(400).json({ error: "Missing relationship input" })
            }
            if(!validRelationships.includes(relationship)){
                logError("Cannot assign student Guardian, invalid relationship", new Error("Failed to assign guardian"), req)
                return res.status(400).json({ error: "Invalid relationship" })
            }
            await repository.assignStudentGuardian(studentId, guardianId, relationship)
            return res.status(200).json({message: `Guardian ${guardianId} assigned to student ${studentId} with relationship ${relationship}`})
            
        }catch(err){
            logError("Error assigning guardian", err, req)
            return res.status(500).json({ error: "Error assigning guardian" })
        }
    })
    
    //Remove Student Guardian
    router.delete("/:id/guardian", async (req: Request, res: Response) => {
        try{
            const studentId = parseInt(req.params.id)
            const guardianId = parseInt(req.body.guardianId)

            if(!guardianId){
                logError("Cannot delete student Guardian, guardian id missing", new Error("Failed to remove guardian"), req)
                return res.status(400).json({error: "Guardian ID missing"})
            }
            await repository.deleteStudentGuardian(studentId, guardianId)
            return res.status(200).json({message: `Guardian ${guardianId} removed from student ${studentId}`})
      }catch (err){
        logError("Error removing student guardian", err, req)
        return res.status(500).json({error: "Error removing guardian from student"})
      }
    })

    //Get Student Guardians
    router.get("/:id/guardian", async (req: Request, res: Response) => {
        try {
            const studentId = parseInt(req.params.id)
            const guardians = await repository.getStudentGuardians(studentId)
            return res.status(200).json(guardians)
        }catch(err){
            logError("Error getting student's guardians", err, req)
            return res.status(500).json({error: "Error getting student's guardians"})
        }
    })

    //Get Student Available Guardians
    router.get("/:id/guardian/available", async (req: Request, res: Response) => {
        try {
            const studentId = parseInt(req.params.id)
            const guardians = await repository.getStudentAvailableGuardians(studentId)
            return res.status(200).json(guardians)
        }catch(err){
            logError("Error getting student's available guardians", err, req)
            return res.status(500).json({error: "Error getting student's available guardians"})
        }
    })

    //Get Student Address
    router.get("/:id/address", async (req: Request, res: Response) => {
        try{
            const studentId = parseInt(req.params.id)
            const address = await repository.getStudentAddress(studentId)
            return res.status(200).json(address)
        }catch(err){
            logError(`Failed to get student address`, err, req)
            return res.status(500).json({error: "Error getting student address"})
        }
    })

    //Add Student Address
    router.post("/:id/address", async (req: Request, res: Response) => {
        try {
            const studentId = parseInt(req.params.id)
            await repository.addStudentAddress(studentId, req.body)
            return res.status(200).json({message: `Address Added`})
        }catch(err){
            logError("Error creating address", err, req)
            return res.status(500).json({error: "Error ceating address"})
        }
    })


    //Update Student Address
    router.put("/:id/address", async (req: Request, res: Response) => {
        try{
            const studentId = parseInt(req.params.id)
            await repository.updateStudentAddress(studentId, req.body)
            return res.status(200).json({message: "Address Updated"})
        }catch(err){
            logError(`Failed to update address`, err, req)
            return res.status(500).json({error: "Error update address"})
        }
    })

    //Get students enrolled classes
    router.get("/:id/classes", async (req : Request, res: Response)=> {
        try{
            const studentId = parseInt(req.params.id)
            const classes = await repository.getStudentsClasses(studentId)
            return res.status(200).json(classes)
            
        }catch(err){
            logError("Error getting classes ", err, req)
            return res.status(500).json({ error: "Error getting classes" })
        }
    })

    //Get students available classes
    router.get("/:id/classes/available", async (req : Request, res: Response)=> {
        try{
            const studentId = parseInt(req.params.id)
            const classes = await repository.getAvailableStudentClasses(studentId)
            return res.status(200).json(classes)
            
        }catch(err){
            logError("Error getting classes ", err, req)
            return res.status(500).json({ error: "Error getting classes" })
        }
    })

    //Enroll student
    router.post("/:id/enrollment", async (req: Request, res: Response) => {
        try {
            const studentId = parseInt(req.params.id)
            const classId = parseInt(req.body.classId)
            if(isNaN(classId)){
                logError("Failed to enroll student. Invalid classId", new Error("Failed to enroll student"), req)
                return res.status(400).json({error: "Invalid class ID"})
            }
            if(!classId){
                logError("Failed to enroll student. Missing classId", new Error("Failed to enroll student"), req)
                return res.status(400).json({error: "Missing class ID"})
            }

            await repository.enrollStudent(studentId, classId)
            
            return res.status(200).json({message: `Student ${studentId} enrolled in class ${classId}`})
        } catch(err){
            logError("Error enrolling student", err, req)
            return res.status(500).json({error: "Error enrolling student"})
        }
    })

    //Unenroll Student
    router.delete("/:id/enrollment", async (req: Request, res: Response) => {
        try {
            const studentId = parseInt(req.params.id)
            const classId = parseInt(req.body.classId)
            if(isNaN(classId)){
                logError("Failed to unenroll student. Invalid classId", new Error("Failed to unenroll student"), req)
                return res.status(400).json({error: "Invalid class ID"})
            }
            if(!classId){
                logError("Failed to unenroll student. missing classId", new Error("Failed to unenroll student"), req)
                return res.status(400).json({error: "Missing class ID"})
            }
            await repository.unenrollStudent(studentId, classId)
            return res.status(200).json({message: `Student ${studentId} unenrolled in class ${classId}`})
        } catch(err){
            logError("Error unenrolling student", err, req)
            return res.status(500).json({error: "Error unenrolling student"})
        }
    })

    //Get student grades
    router.get("/:id/grades", async (req : Request, res: Response)=> {
        try{
            const studentId = parseInt(req.params.id)
            const grades = await repository.getStudentGrades(studentId)
            return res.status(200).json(grades)
            
        }catch(err){
            logError("Error getting grades ", err, req)
            return res.status(500).json({ error: "Error getting grades" })
        }
    })


    //update student grade
    router.put("/:id/grade", async (req: Request, res: Response) => {
        try{
            const studentId = parseInt(req.params.id)
            const classId = parseInt(req.body.classId)
            const grade = parseInt(req.body.grade)
            if(!classId || !grade){
                logError("Error updating student. Missing fields", new Error("Failed to update studnet"), req)
                return res.status(400).json({error: "Missing fields"})
            }
            if (isNaN(grade)) {
                logError("Error updating student. Invalid grade", new Error("Failed to update studnet"), req)
                return res.status(400).json({ error: "Invalid grade" })
            }
            if (isNaN(classId)) {
                logError("Error updating student. Invalid classId", new Error("Failed to update studnet"), req)
                return res.status(400).json({ error: "Invalid classID" })
            }
    
            await repository.updateStudentGrade(studentId, classId, grade)
            return res.status(200).json({message: `Student ${studentId} grade updated to ${grade} in class ${classId}`})
            
        }catch(err){
            logError("Error updating grade", err, req)
            return res.status(500).json({ error: "Error updating grade" })
        }
    })

    return router
}