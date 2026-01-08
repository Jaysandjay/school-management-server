import {Router, Request, Response} from "express"
import { StudentRepository } from "../repositories/types/students.base.repository"
import { Student } from "../types/Student"
import { Address } from "../types/Address"

export function createStudentRouter(repository: StudentRepository){
    const router = Router()

    //Get Students
    router.get("/", async (req: Request, res: Response) => {
        try{
            const students = await repository.getStudents()
            return res.status(200).json(students)
        }catch(err){
            console.error("Failed to fetch students", err)
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
            console.error("Error getting student", err)
            return res.status(500).json({ error: "Error getting student" })
        }
    })

    //Add Student
    router.post("/", async (req: Request, res: Response) => {
        try{
            let {firstName, lastName, dateOfBirth, gradeLevel} = req.body
            if(!firstName || !lastName || !dateOfBirth || !gradeLevel){
                console.error("Error adding student, missing required fields")
                return res.status(400).json({error: 'Error creating student, missing required fields'})
            }
            gradeLevel = parseInt(gradeLevel)
            if (isNaN(gradeLevel)) {
                return res.status(400).json({ error: "Invalid grade type" })
            }
            const student: Student = {firstName, lastName, dateOfBirth, gradeLevel}
            await repository.addStudent(student)
            return res.status(200).json(student)
            
        }catch(err){
            console.error("Error adding student", err)
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
            console.error("Error updating student", err)
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
            console.error("Error deleting student ", err)
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
                console.error("Cannot assign student guardian, guardian ID missing")
                return res.status(400).json({error: `Cannot assign student ${studentId}, missing guardian ID`})
            }
            guardianId = parseInt(guardianId)
            if (isNaN(guardianId)) {
                return res.status(400).json({ error: "Invalid student ID" })
            }
            if(!relationship) {
                console.error("Cannot assign student Guardian, missing relationship input")
                return res.status(400).json({ error: "Missing relationship input" })
            }
            if(!validRelationships.includes(relationship)){
                console.error("Cannot assign student guardian, invalid relationship")
                return res.status(400).json({ error: "Invalid relationship" })
            }
            await repository.assignStudentGuardian(studentId, guardianId, relationship)
            return res.status(200).json({message: `Guardian ${guardianId} assigned to student ${studentId} with relationship ${relationship}`})
            
        }catch(err){
            console.error("Error assigning guardian", err)
            return res.status(500).json({ error: "Error assigning guardian" })
        }
    })
    
    //Remove Student Guardian
    router.delete("/:id/guardian", async (req: Request, res: Response) => {
        try{
            const studentId = parseInt(req.params.id)
            const guardianId = parseInt(req.body.guardianId)

            if(!guardianId){
                console.error("Cannot delete student Guardian, guardian id missing")
                return res.status(400).json({error: "Guardian ID missing"})
            }
            await repository.deleteStudentGuardian(studentId, guardianId)
            return res.status(200).json({message: `Guardian ${guardianId} removed from student ${studentId}`})
      }catch (err){
        console.error("Error removing student guardian", err)
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
            console.error("Error getting student's guardians", err)
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
            console.error("Error getting student's available guardians", err)
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
            console.error(`Failed to get student address`, err)
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
            console.error("Error creating address", err)
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
            console.error(`Failed to update address`, err)
            return res.status(500).json({error: "Error update address"})
        }
    })

    //Get students enrolled classes
    router.get("/:id/classes", async (req : Request, res: Response)=> {
        try{
            const studentId = parseInt(req.params.id)
            const classes = await repository.getStudentsClasses(studentId)
            console.log("Enrolled Classes:", classes)
            return res.status(200).json(classes)
            
        }catch(err){
            console.error("Error getting classes ", err)
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
            console.error("Error getting classes ", err)
            return res.status(500).json({ error: "Error getting classes" })
        }
    })

    //Enroll student
    router.post("/:id/enrollment", async (req: Request, res: Response) => {
        try {
            const studentId = parseInt(req.params.id)
            const classId = parseInt(req.body.classId)
            if(isNaN(classId)){
                console.error("invalid classId")
                return res.status(400).json({error: "Invalid class ID"})
            }
            if(!classId){
                console.error("Missing classId")
                return res.status(400).json({error: "Missing class ID"})
            }
            await repository.enrollStudent(studentId, classId)
            
            return res.status(200).json({message: `Student ${studentId} enrolled in class ${classId}`})
        } catch(err){
            console.error("Error enrolling student", err)
            return res.status(500).json({error: "Error enrolling student"})
        }
    })

    //Unenroll Student
    router.delete("/:id/enrollment", async (req: Request, res: Response) => {
        try {
            const studentId = parseInt(req.params.id)
            const classId = parseInt(req.body.classId)
            if(isNaN(classId)){
                console.error("invalid classId")
                return res.status(400).json({error: "Invalid class ID"})
            }
            if(!classId){
                console.error("Missing classId")
                return res.status(400).json({error: "Missing class ID"})
            }
            await repository.unenrollStudent(studentId, classId)
            return res.status(200).json({message: `Student ${studentId} unenrolled in class ${classId}`})
        } catch(err){
            console.error("Error unenrolling student", err)
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
            console.error("Error getting grades ", err)
            return res.status(500).json({ error: "Error getting grades" })
        }
    })


    //update student grade
    router.put("/:id/grade", async (req: Request, res: Response) => {
        console.log("Updating grade ...")
        try{
            const studentId = parseInt(req.params.id)
            const classId = parseInt(req.body.classId)
            const grade = parseInt(req.body.grade)
            if(!classId || !grade){
                console.error("Error, Missing fields")
                return res.status(400).json({error: "Missing fields"})
            }
            if (isNaN(grade) || isNaN(classId)) {
                console.error("Invalid Types")
                return res.status(400).json({ error: "Invalid types" })
            }
    
            await repository.updateStudentGrade(studentId, classId, grade)
            return res.status(200).json({message: `Student ${studentId} grade updated to ${grade} in class ${classId}`})
            
        }catch(err){
            console.error("Error updating grade", err)
            return res.status(500).json({ error: "Error updating grade" })
        }
    })

    return router
}