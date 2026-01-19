import {Router, Request, Response} from "express"
import { ClassesRepository } from "../repositories/types/classes.base.repository"
import { Course } from "../types/Course"
import logError from "../util/logError"

export function createClassRouter(repository: ClassesRepository){
    const router = Router()

      //Get unassigned Classes
    router.get("/unassigned", async (req: Request, res: Response) => {
        try{
            const classes = await repository.getUnassignedClasses()
            return res.status(200).json(classes)
        } catch(err){
            logError("Error getting unassigned classes", err, req)
            return res.status(500).json({error: "Error getting unassigned classes"})
        }
    })

    //Get classes
     router.get("/", async (req: Request, res: Response) => {
        try{
            const classes = await repository.getClasses()
            return res.status(200).json(classes)
        }catch(err){
            logError("Error fetching classes", err, req)
            return res.status(500).json({error: "Error fetching classes"})
        }
    })

    //Get Class by ID
    router.get("/:id", async (req: Request, res: Response) => {
        try{
            const classId = parseInt(req.params.id)
            if(!classId || isNaN(classId)){
                logError("Invalid Class Id", new Error("Failed to get class"), req)
                return res.status(400).json({error: "Invalid class Id"})
            }
            const course = await repository.getClass(classId)
            return res.status(200).json(course)
            
        }catch(err){
            logError("Error getting class", err, req)
            return res.status(500).json({ error: "Error getting class" })
        }
    }) 


    //Create Class
    router.post("/", async(req: Request, res: Response) => {
        try{
            let {className, gradeLevel, capacity} = req.body
            let error = new Error("Failed to create class")
            if(!className || !gradeLevel){
                logError("Missing class Name", error, req)
               return res.status(400).json({error: "Missing Class Name"})
            }
            gradeLevel = parseInt(gradeLevel)

            if (isNaN(gradeLevel) || gradeLevel < 9 ||gradeLevel > 12) {
                logError("Invalid grade", error, req)
                return res.status(400).json({ error: "Invalid grade level" })
            }
            capacity = parseInt(capacity)
            if (isNaN(capacity) || capacity < 0 ) {
                logError("Invalid capacity", error, req)
                return res.status(400).json({ error: "Invalid capacity" })
            }
            const course: Course = {className, gradeLevel, capacity}
            await repository.addClass(course)
            return res.status(200).json({course})
            
        }catch(err){
            logError("Error creating class", err, req)
            return res.status(500).json({ error: "Error creating class" })
        }
    })

    //Update Class
    router.put("/:id", async (req: Request, res: Response) => {
        try{
            const classId = parseInt(req.params.id)
            if(!classId || isNaN(classId)){
                logError("Invalid Class Id", new Error("Failed to get class"), req)
                return res.status(400).json({error: "Invalid class Id"})
            }
            const updatedClass = req.body
            if(!req.body){
                logError("Missing class details", new Error("Failed to update class"), req)
                return res.status(400).json({error: "Missing class details"})
            }
            await repository.updateClass(classId, updatedClass)
            return res.status(200).json(updatedClass)
        }catch(err){
            logError("Error updating class", err, req)
            return res.status(500).json({error: "Error updating class"})
        }
    })

    //Delete Class
    router.delete('/:id', async (req: Request, res: Response) => {
        try{
            const classId = parseInt(req.params.id)
            if(!classId || isNaN(classId)){
                logError("Invalid Class Id", new Error("Failed to delete class"), req)
                return res.status(400).json({error: "Invalid class Id"})
            }
            await repository.deleteClass(classId)
            return res.status(200).json({message: `Class with ID ${classId} deleted`})
            
        }catch(err){
            logError("Error deleting class", err, req)
            return res.status(500).json({ error: "Error deleting class" })
        }
    })

    //Assign Teacher
    router.put("/:id/teacher", async (req: Request, res: Response) => {
        try{
            const classId = parseInt(req.params.id)
            const teacherId = parseInt(req.body.teacherId)
            let error = new Error("Failed to assign teacher")
            if(!classId || isNaN(classId)){
                logError("Invalid Class Id", error, req)
                return res.status(400).json({error: "Invalid class Id"})
            }
            if(!teacherId || isNaN(teacherId)){
                logError("Invalid teacher Id", error, req)
                return res.status(400).json({error: "Invalid teacher Id"})
            }
            await repository.assignTeacherToClass(classId, teacherId)
            return res.status(200).json({message: `Teacher ${teacherId} assigned to class ${classId}`})
            
        }catch(err){
            logError("Error assigning teacher", err, req)
            return res.status(500).json({ error: "Error assigning teacher" })
        }
    })

    //Remove Teacher from Class
    router.delete("/:id/teacher", async (req: Request, res: Response) => {
        try {
            const classId = parseInt(req.params.id)
            if(!classId || isNaN(classId)){
                logError("Invalid Class Id", new Error("Failed to remove teacher from class "), req)
                return res.status(400).json({error: "Invalid class Id"})
            }
            await repository.removeTeacherFromClass(classId)
            return res.status(200).json({ message: `Teacher removed from class ${classId}` })

        } catch (err) {
            logError("Error removing teacher", err, req)
            return res.status(500).json({ error: "Error removing teacher" })
        }
    })

    //Get Class Teacher
    router.get("/:id/teacher", async (req: Request, res: Response) => {
        try{
            const classId = parseInt(req.params.id)
            if(!classId || isNaN(classId)){
                logError("Invalid Class Id", new Error("Failed to get class teacher"), req)
                return res.status(400).json({error: "Invalid class Id"})
            }
            const teacher = await repository.getClassTeacher(classId)
            return res.status(200).json(teacher)
        } catch(err){
            logError("Error getting class teacher", err, req)
            return res.status(500).json({error: "Error getting class teacher"})
        }
    })

    //Get Students
    router.get("/:id/students", async (req: Request, res: Response) => {
        try{
            const classId = parseInt(req.params.id)
            if(!classId || isNaN(classId)){
                logError("Invalid Class Id", new Error("Failed to get class"), req)
                return res.status(400).json({error: "Invalid class Id"})
            }
            const students = await repository.getClassStudents(classId)
            return res.status(200).json(students)
            
        }catch(err){
            logError("Error getting enrollments", err, req)
            return res.status(500).json({ error: "Error getting enrollments" })
        }
    })

    //Get available Students
    router.get("/:id/students/available", async (req: Request, res: Response) => {
        try{
            const classId = parseInt(req.params.id)
            if(!classId || isNaN(classId)){
                logError("Invalid Class Id", new Error("Failed to get class"), req)
                return res.status(400).json({error: "Invalid class Id"})
            }
            const students = await repository.getClassAvailableStudents(classId)
            return res.status(200).json(students)
            
        }catch(err){
            logError("Error getting available students", err, req)
            return res.status(500).json({ error: "Error getting available students" })
        }
    })

    //Get student grades
    router.get("/:id/grades", async (req : Request, res: Response)=> {
        try{
            const classId = parseInt(req.params.id)
            if(!classId || isNaN(classId)){
                logError("Invalid Class Id", new Error("Failed to get class"), req)
                return res.status(400).json({error: "Invalid class Id"})
            }
            const grades = await repository.getClassGrades(classId)
            return res.status(200).json(grades)
            
        }catch(err){
            logError("Error getting grades ", err, req)
            return res.status(500).json({ error: "Error getting grades" })
        }
    })

    

    return router

    
}