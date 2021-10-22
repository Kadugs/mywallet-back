import connection from '../database/database.js';
import {validateSignIn} from "../validation/sign-in.js"
import bcrypt from 'bcrypt';
import {v4 as uuid} from 'uuid';

async function userLogin(req, res) {
    const {email, password} = req.body;
    const validate = validateSignIn.validate({
        email, 
        password,
    })
    if(validate.error) {
        res.status(400).send("Dados inseridos inválidos, tente novamente!");
        return;
    }
    try {
        const database = await connection.query(`SELECT users.password, users.id FROM users where email = $1`, [email]);
        if(database.rowCount === 0) {
            res.status(401).send("Email não cadastrado, tente novamente ou crie uma conta!");
            return;
        }
        if(bcrypt.compareSync(password, database.rows[0].password)) {
            const token = uuid();
            await connection.query(`
                INSERT INTO sessions 
                (user_id, token) 
                VALUES ($1, $2)`, 
                [database.rows[0].id, token]
            )
            res.send(token);
            return;
        } else {
            res.status(401).send("Senha inválida!");
        }
    } catch {
        res.status(500).send("Erro no servidor!");
    }

}
export {
    userLogin,
}