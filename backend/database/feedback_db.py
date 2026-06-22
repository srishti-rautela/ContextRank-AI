import sqlite3


DB_FILE = "feedback.db"


def create_table():

    conn = sqlite3.connect(DB_FILE)

    cur = conn.cursor()


    cur.execute(
        """

        CREATE TABLE IF NOT EXISTS feedback(

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        candidate_id TEXT,

        skill_score INTEGER,

        project_score INTEGER,

        experience_score INTEGER,

        selected INTEGER

        )

        """
    )


    conn.commit()

    conn.close()



def save_feedback(data):

    create_table()


    conn = sqlite3.connect(DB_FILE)

    cur = conn.cursor()


    cur.execute(
        """

        INSERT INTO feedback(

        candidate_id,

        skill_score,

        project_score,

        experience_score,

        selected

        )

        VALUES (?,?,?,?,?)

        """,

        (

        data["candidate_id"],

        data["skill_score"],

        data["project_score"],

        data["experience_score"],

        data["selected"]

        )

    )


    conn.commit()

    conn.close()



def load_feedback():

    create_table()


    conn = sqlite3.connect(DB_FILE)

    cur = conn.cursor()


    cur.execute(
        """
        SELECT 
        candidate_id,
        skill_score,
        project_score,
        experience_score,
        selected

        FROM feedback
        """
    )


    rows = cur.fetchall()


    conn.close()


    return [

        {

        "candidate_id":r[0],

        "skill_score":r[1],

        "project_score":r[2],

        "experience_score":r[3],

        "selected":r[4]

        }

        for r in rows

    ]