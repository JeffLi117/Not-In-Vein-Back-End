import { UnauthorizedError } from "./expressError.js";
import { getAuth } from 'firebase-admin/auth';

/* middleware to verify token if token was received */
export async function authenticateToken(req, res, next) {
    try {
        // console.debug(`authenticateToken ran`);
        // console.log(req.headers);
        // console.log(req.headers.authorization);
        const authHeader = req.headers && req.headers.authorization;
        // console.log("authHeader on line 10 is ", authHeader);
        if (authHeader) {
            const token = authHeader.replace(/^[Bb]earer /, "").trim();
            // console.log("token on line 13 is ", token);
            try {
                const decodedToken = await getAuth().verifyIdToken(token);
                res.locals.userId = decodedToken.uid;
                // console.log("token decoded, uid is ", res.locals.userId);
            } catch (error) {
                console.error(error);
            }
        }
        return next();
    } catch (err) {
        console.error(err);
        return next();
    }
}

/* middleware to limit access only to user */
export function userOnly(req, res, next) {
    try {
        const userId = res.locals.userId;
        if(userId !== req.params.id) {
            throw new UnauthorizedError();
        } 
        return next();
    } catch(err) {
        return next(err);
    }
}
