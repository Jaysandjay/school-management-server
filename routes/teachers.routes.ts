import {Router, Request, Response} from "express"
import { TeachersRepository } from "../repositories/types/teachers.base.repository"

export function createTeacherRouter(repository: TeachersRepository){
    const router = Router()

    //Get Teachers
    router.get("/", async (req: Request, res: Response) => {
        try{
            const teachers = await repository.getTeachers()
            return res.status(200).json(teachers)
        }catch(err){
            console.error("Error fetching teachers", err)
            return res.status(500).json({error: "Error fetching teachers"})
        }
    })

    //Get Teacher by ID
    router.get("/:id", async (req: Request, res: Response) => {
        try{
            const id = parseInt(req.params.id)
            const teacher = await repository.getTeacher(id)
            return res.status(200).json(teacher)
            
        }catch(err){
            console.error("Error getting teacher", err)
            return res.status(500).json({ error: "Error getting teacher" })
        }
    })

    //Create Teacher
    router.post("/", async (req: Request, res: Response) => {
        try{
            const {firstName, lastName, email, phone} = req.body
            const teacher = {firstName, lastName, email, phone}
            if(!firstName || ! lastName || !email || !phone){
                console.error("Cant Create Teacher. Missing Required Fields")
                return res.status(400).json({error: "Missing Teacher Required Fields"})
            }
            await repository.addTeacher(teacher)
            res.status(200).json(teacher)
            
        }catch(err){
            console.error("Error adding teacher", err)
            return res.status(500).json({ error: "Error adding teacjer" })
        }
    })

    //Update Teacher
    router.put("/:id", async (req: Request, res: Response) => {
        try{
            const teacherId = parseInt(req.params.id)
            const {firstName, lastName, email, phone} = req.body
            const updatedTeacherInfo = {firstName, lastName, email, phone}
            await repository.updateTeacher(teacherId, updatedTeacherInfo)
            const teacher = {
                teacher_id: teacherId,
                ...updatedTeacherInfo
            }
            res.status(200).json(teacher)  
            
        }catch(err){
            console.error("Error updating teacher", err)
            return res.status(500).json({ error: "Error updating teacher" })
        }
    })

    //Delete Teacher
    router.delete("/:id", async (req: Request, res: Response) => {
        try{
            const teacherId = parseInt(req.params.id)
            await repository.deleteTeacher(teacherId)
            res.status(200).json({message: `Teacher ${teacherId} deleted`})
            
        }catch(err){
            console.error("Error deleting teacher", err)
            return res.status(500).json({ error: "Error deleting teacher" })
        }

    })

    return router
}