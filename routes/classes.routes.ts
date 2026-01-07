import {Router, Request, Response} from "express"
import { ClassesRepository } from "../repositories/types/classes.base.repository"
import { Course } from "../types/Course"

export function createClassRouter(repository: ClassesRepository){
    const router = Router()

    //Get Teachers
     router.get("/", async (req: Request, res: Response) => {
        try{
            const classes = await repository.getClasses()
            return res.status(200).json(classes)
        }catch(err){
            console.error("Error fetching classes", err)
            return res.status(500).json({error: "Error fetching classes"})
        }
    })

    //Get Class by ID
    router.get("/:id", async (req: Request, res: Response) => {
        try{
            const classId = parseInt(req.params.id)
            const course = await repository.getClass(classId)
            console.log("Classes:", course)
            return res.status(200).json(course)
            
        }catch(err){
            console.error("Error getting class", err)
            return res.status(500).json({ error: "Error getting class" })
        }
    }) 


    //Create Class
    router.post("/", async(req: Request, res: Response) => {
        try{
            console.log("Create Class With:", req.body)
            let {className, gradeLevel, capacity} = req.body
            if(!className || !gradeLevel){
               return res.status(400).json({error: "Missing Class Name"})
            }
            gradeLevel = parseInt(gradeLevel)
            if (isNaN(gradeLevel)) {
                return res.status(400).json({ error: "Invalid grade type" })
            }
            if (isNaN(gradeLevel) || gradeLevel < 9 ||gradeLevel > 12) {
                console.error('Invalid grade level')
                return res.status(400).json({ error: "Invalid grade level" })
            }
            capacity = parseInt(capacity)
            if (isNaN(capacity) || capacity < 0 ) {
                console.log('Invalid capacity')
                return res.status(400).json({ error: "Invalid capacity" })
            }
            console.log("Validation passed")
            const course: Course = {className, gradeLevel, capacity}
            await repository.addClass(course)
            return res.status(200).json({course})
            
        }catch(err){
            console.error("Error creating class", err)
            return res.status(500).json({ error: "Error creating class" })
        }
    })

    //Delete Class
    router.delete('/:id', async (req: Request, res: Response) => {
        try{
            const classId = parseInt(req.params.id)
            await repository.deleteClass(classId)
            return res.status(200).json({message: `Class with ID ${classId} deleted`})
            
        }catch(err){
            console.error("Error deleting class", err)
            return res.status(500).json({ error: "Error deleting class" })
        }
    })

    //Assign Teacher
    router.put("/:id/teacher", async (req: Request, res: Response) => {
        try{
            const classId = parseInt(req.params.id)
            const teacherId = parseInt(req.body.teacherId)
            if(!classId || !teacherId){
                return res.status(400).json({error: "Missing fields"})
            }
            if (isNaN(teacherId)) {
                return res.status(400).json({ error: "Invalid student ID" })
            }
    
            await repository.assignTeacherToClass(classId, teacherId)
            return res.status(200).json({message: `Teacher ${teacherId} assigned to class ${classId}`})
            
        }catch(err){
            console.error("Error assigning teacher", err)
            return res.status(500).json({ error: "Error assigning teacher" })
        }
    })

    //Remove Teacher from Class
    router.delete("/:id/teacher", async (req: Request, res: Response) => {
        try {
            const classId = parseInt(req.params.id)

            if (!classId || isNaN(classId)) {
                return res.status(400).json({ error: "Invalid class ID" })
            }

            await repository.removeTeacherFromClass(classId)

            return res.status(200).json({ message: `Teacher removed from class ${classId}` })

        } catch (err) {
            console.error("Error removing teacher", err)
            return res.status(500).json({ error: "Error removing teacher" })
        }
    })

    //Get Class Teacher
    router.get("/:id/teacher", async (req: Request, res: Response) => {
        try{
            const classId = parseInt(req.params.id)
            const teacher = await repository.getClassTeacher(classId)
            return res.status(200).json(teacher)
        } catch(err){
            console.error("Error getting class teacher", err)
            return res.status(500).json({error: "Errir getting class teacher"})
        }
    })

    //Get Students
    router.get("/:id/students", async (req: Request, res: Response) => {
        try{
            const classId = parseInt(req.params.id)
            const students = await repository.getClassStudents(classId)
            return res.status(200).json(students)
            
        }catch(err){
            console.error("Error getting enrollments", err)
            return res.status(500).json({ error: "Error getting enrollments" })
        }
    })

    //Get available Students
    router.get("/:id/students/available", async (req: Request, res: Response) => {
        try{
            const classId = parseInt(req.params.id)
            const students = await repository.getClassAvailableStudents(classId)
            return res.status(200).json(students)
            
        }catch(err){
            console.error("Error getting available students", err)
            return res.status(500).json({ error: "Error getting available students" })
        }
    })

    return router
}