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



    return router
}
