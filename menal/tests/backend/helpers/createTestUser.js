import bcrypt from "bcrypt";

export async function createTestUser(db, name, email, password) {
    const passwordHash = await bcrypt.hash(password, 12);

    db.prepare(`
        INSERT INTO users (name, email, password_hash)
        VALUES (?, ?, ?)
    `).run(
        name,
        email,
        passwordHash,
    );

    return {
        name,
        email,
        password,
    };
}