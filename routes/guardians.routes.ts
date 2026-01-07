import {Router, Response, Request} from "express"
import { GuardiansRepository } from "../repositories/types/guardians.base.repository"

export function createGuardianRouter(repository: GuardiansRepository){
    const router = Router()

    //Get Guardians
     router.get("/", async (req: Request, res: Response) => {
        try{
            const guardians = await repository.getGuardians()
            return res.status(200).json(guardians)
        }catch(err){
            console.error("Error fetching guardians", err)
            return res.status(500).json({error: "Error fetching guardians"})
        }
    })

    //Get Guardian by ID
    router.get("/:id", async (req: Request, res: Response) => {
        try{
            const guardianId = parseInt(req.params.id)
            const guardian = await repository.getGuardian(guardianId)
            return res.status(200).json(guardian)
            
        }catch(err){
            console.error("Error getting guardian", err)
            return res.status(500).json({ error: "Error getting guardian" })
        }
    })

    
    //Add Guardian
    router.post("/", async (req: Request, res: Response) => {
        try{
            const {firstName, lastName, phone, email} = req.body
            if(!firstName || !lastName || !phone || !email){
                console.error("Cannot add guardian, missing required fields")
                return res.status(400).json({error: "Cannot add guardian, missing required fields"})
            }
            const guardian = {firstName, lastName, phone, email}
            await repository.addGuardian(guardian)
            return res.status(200).json(guardian)
            
        }catch(err){
            console.error("Error adding guardian", err)
            return res.status(500).json({ error: "Error adding guardian" })
        }
    })

    //Update Guardian
    router.put("/:id", async (req: Request, res: Response) => {
        try{
            const guardianId = parseInt(req.params.id)
            const updatedGuardian = req.body
            await repository.updateGuardian(guardianId, updatedGuardian)
            return res.status(200).json(updatedGuardian)
        }catch(err){
            console.error("Error updating guardian", err)
            return res.status(500).json({error: "Error updating guardian"})
        }
    })

    //Delete Guardian
    router.delete("/:id", async (req: Request, res: Response) => {
        try{
            const guardianId = parseInt(req.params.id)
            await repository.deleteGuardian(guardianId)
            res.send(200).json({message: `Deleted guardian ${guardianId}`})
            
        }catch(err){
            console.error("Error deleting guardian", err)
            return res.status(500).json({ error: "Error deleting guardian" })
        }
    })

    //Get Guardians students
    router.get("/:id/student", async (req: Request, res: Response) => {
        try {
            const guardianId = parseInt(req.params.id)
            const students = await repository.getGuardianStudents(guardianId)
            return res.status(200).json(students)
        }catch(err){
            console.error("Error getting guardian's students", err)
            return res.status(500).json({error: "Error getting guardian's students"})
        }
    })

    //Get Student Available Guardians
    router.get("/:id/student/available", async (req: Request, res: Response) => {
        try {
            const guardianId = parseInt(req.params.id)
            const students = await repository.getAvailableGuardianStudents(guardianId)
            return res.status(200).json(students)
        }catch(err){
            console.error("Error getting guardian's available students", err)
            return res.status(500).json({error: "Error getting guardian's available students"})
        }
    })

    //Get Guardian address
    router.get("/:id/address", async (req: Request, res: Response) => {
        try{
            const guardinId = parseInt(req.params.id)
            const address = await repository.getGuardianAddress(guardinId)
            return res.status(200).json(address)
        }catch(err){
            console.error(`Failed to get address`, err)
            return res.status(500).json({error: "Error get address"})
        }
    })

    //Add Guardian Address
    router.post("/:id/address", async (req: Request, res: Response) => {
        try {
            const guardianId = parseInt(req.params.id)
            await repository.addGuardianAddress(guardianId, req.body)
            return res.status(200).json({message: `Address Added`})
        }catch(err){
            console.error("Error creating address", err)
            return res.status(500).json({error: "Error ceating address"})
        }
    })

    //Update Guardian Address
    router.put("/:id/address", async (req: Request, res: Response) => {
        try{
            const guardianId = parseInt(req.params.id)
            await repository.updateGuardianAddress(guardianId, req.body)
            return res.status(200).json({message: "Address Updated"})
        }catch(err){
            console.error(`Failed to update address`, err)
            return res.status(500).json({error: "Error update address"})
        }
    })


    return router
}
