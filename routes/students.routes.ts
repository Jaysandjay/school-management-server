import {Router, Request, Response} from "express"
import { StudentRepository } from "../repositories/types/students.base.repository"

export function createStudentRouter(reposirory: StudentRepository){
    const router = Router()

    //Get Student
    router.get('/:id', async (req: Request, res: Response) => {
        try{
            const studentId = parseInt(req.params.id)
            const student = await reposirory.getStudent(studentId)
            console.log("Student:", student)
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
            const student = {firstName, lastName, dateOfBirth, gradeLevel}
            await reposirory.addStudent(student)
            return res.status(200).json(student)
            
        }catch(err){
            console.error("Error adding student", err)
            return res.status(500).json({ error: "Error adding student" })
        }
    })

    //Delete Student
    router.delete("/:id", async (req: Request, res: Response) => {
        try{
            const studentId = parseInt(req.params.id)
            await reposirory.deleteStudent(studentId)
            return res.status(200).json({message: `Student ${studentId} deleted`})
            
        }catch(err){
            console.error("Error deleting student ", err)
            return res.status(500).json({ error: "Error deleting student" })
        }
    })

    //Assign Student Guardian
    router.put("/:id", async (req: Request, res: Response) => {
        try{
            const student_id = parseInt(req.params.id)
            const guardianId = parseInt(req.body.guardianId)
            if(!guardianId){
                console.error("Cannot update student guardian, guardian ID missing")
                return res.status(400).json({error: `Cannot update student ${student_id}, missing guardian ID`})
            }
            if (isNaN(guardianId)) {
                return res.status(400).json({ error: "Invalid student ID" })
            }
            await reposirory.assignStudentGuardian(student_id, guardianId)
            return res.status(200).json({message: `Guardian ${guardianId} assigned to student ${student_id}`})
            
        }catch(err){
            console.error("Error assigning guardian", err)
            return res.status(500).json({ error: "Error assigning guardian" })
        }
    })

    return router
}