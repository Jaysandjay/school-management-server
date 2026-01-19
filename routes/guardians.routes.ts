import {Router, Response, Request} from "express"
import { GuardiansRepository } from "../repositories/types/guardians.base.repository"
import logError from "../util/logError"
import { error } from "node:console"

export function createGuardianRouter(repository: GuardiansRepository){
    const router = Router()

    //Get Guardians
     router.get("/", async (req: Request, res: Response) => {
        try{
            const guardians = await repository.getGuardians()
            return res.status(200).json(guardians)
        }catch(err){
            logError("Error fetching guardians", err, req)
            return res.status(500).json({error: "Error fetching guardians"})
        }
    })

    //Get Guardian by ID
    router.get("/:id", async (req: Request, res: Response) => {
        try{
            const guardianId = parseInt(req.params.id)
            if(!guardianId || isNaN(guardianId)){
                logError("Invalid guardianId", new Error("Failed to get guardian"), req)
                res.status(400).json({error: "Invalid guardianId"})
            }
            const guardian = await repository.getGuardian(guardianId)
            return res.status(200).json(guardian)
            
        }catch(err){
            logError("Error getting guardian", err, req)
            return res.status(500).json({ error: "Error getting guardian" })
        }
    })

    
    //Add Guardian
    router.post("/", async (req: Request, res: Response) => {
        try{
            const {firstName, lastName, phone, email} = req.body
            if(!firstName || !lastName || !phone || !email){
                logError("Missing required fields", new Error("Failed to add guardina"), req)
                return res.status(400).json({error: "Cannot add guardian, missing required fields"})
            }
            const guardian = {firstName, lastName, phone, email}
            await repository.addGuardian(guardian)
            return res.status(200).json(guardian)
            
        }catch(err){
            logError("Error adding guardian", err, req)
            return res.status(500).json({ error: "Error adding guardian" })
        }
    })

    //Update Guardian
    router.put("/:id", async (req: Request, res: Response) => {
        try{
            const guardianId = parseInt(req.params.id)
            const updatedGuardian = req.body
            if(!guardianId || isNaN(guardianId)){
                logError("Invalid guardianId", new Error("Failed to update guardian"), req)
                res.status(400).json({error: "Invalid guardianId"})
            }
            if(!req.body){
                logError("Missing guradian details", new Error("Failed to update guardian"), req)
                res.status(400).json({error: "Missing guardian details"})
            }
            await repository.updateGuardian(guardianId, updatedGuardian)
            return res.status(200).json(updatedGuardian)
        }catch(err){
            logError("Error updating guardian", err, req)
            return res.status(500).json({error: "Error updating guardian"})
        }
    })

    //Delete Guardian
    router.delete("/:id", async (req: Request, res: Response) => {
        try{
            const guardianId = parseInt(req.params.id)
            if(!guardianId || isNaN(guardianId)){
                logError("Invalid guardianId", new Error("Failed to delete guardian"), req)
                res.status(400).json({error: "Invalid guardianId"})
            }
            await repository.deleteGuardian(guardianId)
            res.send(200).json({message: `Deleted guardian ${guardianId}`})
            
        }catch(err){
            logError("Error deleting guardian", err, req)
            return res.status(500).json({ error: "Error deleting guardian" })
        }
    })

    //Get Guardians students
    router.get("/:id/student", async (req: Request, res: Response) => {
        try {
            const guardianId = parseInt(req.params.id)
            if(!guardianId || isNaN(guardianId)){
                logError("Invalid guardianId", new Error("Failed to get guardian's assigned students"), req)
                res.status(400).json({error: "Invalid guardianId"})
            }
            const students = await repository.getGuardianStudents(guardianId)
            return res.status(200).json(students)
        }catch(err){
            logError("Error getting guardian's assigned students", err, req)
            return res.status(500).json({error: "Error getting guardian's assigned students"})
        }
    })

    //Get Student Available Guardians
    router.get("/:id/student/available", async (req: Request, res: Response) => {
        try {
            const guardianId = parseInt(req.params.id)
            if(!guardianId || isNaN(guardianId)){
                logError("Invalid guardianId", new Error("Failed to get guardian's unassigned students"), req)
                res.status(400).json({error: "Invalid guardianId"})
            }
            const students = await repository.getAvailableGuardianStudents(guardianId)
            return res.status(200).json(students)
        }catch(err){
            logError("Error getting guardian's unassigned students", err, req)
            return res.status(500).json({error: "Error getting guardian's unassigned students"})
        }
    })

    //Get Guardian address
    router.get("/:id/address", async (req: Request, res: Response) => {
        try{
            const guardianId = parseInt(req.params.id)
            if(!guardianId || isNaN(guardianId)){
                logError("Invalid guardianId", new Error("Failed to get guardian address"), req)
                res.status(400).json({error: "Invalid guardianId"})
            }
            const address = await repository.getGuardianAddress(guardianId)
            return res.status(200).json(address)
        }catch(err){
            logError(`Failed to get guardian address`, err, req)
            return res.status(500).json({error: "Error getting address"})
        }
    })

    //Add Guardian Address
    router.post("/:id/address", async (req: Request, res: Response) => {
        try {
            const guardianId = parseInt(req.params.id)
            if(!guardianId || isNaN(guardianId)){
                logError("Invalid guardianId", new Error("Failed to add guardian address"), req)
                res.status(400).json({error: "Invalid guardianId"})
            }
            await repository.addGuardianAddress(guardianId, req.body)
            return res.status(200).json({message: `Address Added`})
        }catch(err){
            logError("Error adding guardian address", err, req)
            return res.status(500).json({error: "Error ceating address"})
        }
    })

    //Update Guardian Address
    router.put("/:id/address", async (req: Request, res: Response) => {
        try{
            const guardianId = parseInt(req.params.id)
            if(!guardianId || isNaN(guardianId)){
                logError("Invalid guardianId", new Error("Failed to update guardian address"), req)
                res.status(400).json({error: "Invalid guardianId"})
            }
            if(!req.body){
                logError("Missing address details", new Error("Failed to update guardian address"), req)
                res.status(400).json({error: "Missing address details"})
            }
            await repository.updateGuardianAddress(guardianId, req.body)
            return res.status(200).json({message: "Address Updated"})
        }catch(err){
            logError(`Failed to update address`, err, req)
            return res.status(500).json({error: "Error update address"})
        }
    })


    return router
}
