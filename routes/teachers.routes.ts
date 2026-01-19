import {Router, Request, Response} from "express"
import { TeachersRepository } from "../repositories/types/teachers.base.repository"
import logError from "../util/logError"

export function createTeacherRouter(repository: TeachersRepository){
    const router = Router()

    //Get Teachers
    router.get("/", async (req: Request, res: Response) => {
        try{
            const teachers = await repository.getTeachers()
            return res.status(200).json(teachers)
        }catch(err){
            logError("Error fetching teachers", err, req)
            return res.status(500).json({error: "Error fetching teachers"})
        }
    })

    //Get Teacher by ID
    router.get("/:id", async (req: Request, res: Response) => {
        try{
            const teacherId = parseInt(req.params.id)
            if(!teacherId || isNaN(teacherId)){
                logError("Invalid teacherId", new Error("Failed to get Teacher"), req)
                res.status(400).json({error: "Invalid teacherId"})
            }
            const teacher = await repository.getTeacher(teacherId)
            return res.status(200).json(teacher)
        }catch(err){
            logError("Error getting teacher", err, req)
            return res.status(500).json({ error: "Error getting teacher" })
        }
    })

    //Create Teacher
    router.post("/", async (req: Request, res: Response) => {
        try{
            const {firstName, lastName, email, phone} = req.body
            const teacher = {firstName, lastName, email, phone}
            if(!firstName || ! lastName || !email || !phone){
                logError("Missing Required Fields", new Error("Failed to create teacher"), req)
                return res.status(400).json({error: "Missing Teacher Required Fields"})
            }
            await repository.addTeacher(teacher)
            res.status(200).json(teacher)
        }catch(err){
            logError("Error adding teacher", err, req)
            return res.status(500).json({ error: "Error adding teacjer" })
        }
    })
    
    //Update Teacher
    router.put("/:id", async (req: Request, res: Response) => {
        try{
            const teacherId = parseInt(req.params.id)
            if(!teacherId || isNaN(teacherId)){
                logError("Invalid teacherId", new Error("Failed to update Teacher"), req)
                res.status(400).json({error: "Invalid teacherId"})
            }
            const {firstName, lastName, email, phone} = req.body
            if(!firstName || ! lastName || !email || !phone){
                logError("Missing Required Fields", new Error("Failed to update teacher"), req)
                return res.status(400).json({error: "Missing Teacher Required Fields"})
            }
            const updatedTeacherInfo = {firstName, lastName, email, phone}
            await repository.updateTeacher(teacherId, updatedTeacherInfo)
            const teacher = {
                teacher_id: teacherId,
                ...updatedTeacherInfo
            }
            res.status(200).json(teacher)  
            
        }catch(err){
            logError("Error updating teacher", err, req)
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

    //Get teacher classes
     router.get("/:id/classes", async (req: Request, res: Response) => {
        try{
            const teacherId = parseInt(req.params.id)
            if(!teacherId || isNaN(teacherId)){
                logError("Invalid teacherId", new Error("Failed to get Teacher's classes"), req)
                res.status(400).json({error: "Invalid teacherId"})
            }
            const classes = await repository.getTeacherClasses(teacherId)
            return res.status(200).json(classes)
        }catch(err){
            logError(`Failed to get teachers classes`, err, req)
            return res.status(500).json({error: "Error getting teachers classes"})
        }
    })

    //Get teacher address
    router.get("/:id/address", async (req: Request, res: Response) => {
        try{
            const teacherId = parseInt(req.params.id)
            if(!teacherId || isNaN(teacherId)){
                logError("Invalid teacherId", new Error("Failed to get Teacher's address"), req)
                res.status(400).json({error: "Invalid teacherId"})
            }
            const address = await repository.getTeacherAddress(teacherId)
            return res.status(200).json(address)
        }catch(err){
            logError(`Failed to update address`, err)
            return res.status(500).json({error: "Error updating address"})
        }
    })

    //Add Teacher Address
    router.post("/:id/address", async (req: Request, res: Response) => {
        try {
            const teacherId = parseInt(req.params.id)
            if(!teacherId || isNaN(teacherId)){
                logError("Invalid teacherId", new Error("Failed to add Teacher address"), req)
                res.status(400).json({error: "Invalid teacherId"})
            }
            await repository.addTeacherAddress(teacherId, req.body)
            return res.status(200).json({message: `Address Added`})
        }catch(err){
            logError("Error creating address", err)
            return res.status(500).json({error: "Error ceating address"})
        }
    })

    //Update Teacher Address
    router.put("/:id/address", async (req: Request, res: Response) => {
        try{
            const teacherId = parseInt(req.params.id)
            if(!teacherId || isNaN(teacherId)){
                logError("Invalid teacherId", new Error("Failed to update Teacher's address"), req)
                res.status(400).json({error: "Invalid teacherId"})
            }
            await repository.updateTeacherAddress(teacherId, req.body)
            return res.status(200).json({message: "Address Updated"})
        }catch(err){
            logError(`Failed to update teacher's address`, err)
            return res.status(500).json({error: "Error update address"})
        }
    })




    return router
}