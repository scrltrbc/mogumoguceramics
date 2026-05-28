CREATE TABLE IF NOT EXISTS seturi (
                                      id SERIAL PRIMARY KEY,
                                      nume_set VARCHAR(100) NOT NULL,
    descriere_set TEXT
    );

CREATE TABLE IF NOT EXISTS asociere_set (
                                            id SERIAL PRIMARY KEY,
                                            id_set INT REFERENCES seturi(id) ON DELETE CASCADE,
    id_produs INT REFERENCES produse(id) ON DELETE CASCADE
    );


INSERT INTO seturi (nume_set, descriere_set) VALUES
                                                 ('Set Primăvăratic', 'Pachetul perfect pentru a păstra florile de primăvară într-o vază stilată.'),
                                                 ('Set Decorațiuni Elegante', 'Vaze rafinate decorate manual și o figurină mistică din ceramică.'),
                                                 ('Set Cadou Ziua Femeii', 'Trei buchete deosebite pentru mamă, iubită și fetiță.'),
                                                 ('Set Ceramică Cosmică', 'Obiecte unice pictate cu motive transcendente.'),
                                                 ('Set Colecționar mogumogu', 'Pachet complet ce adună cele mai apreciate figurine din atelier.');


INSERT INTO asociere_set (id_set, id_produs) VALUES
                                                 (1, 13), (1, 11),
                                                 (2, 1), (2, 8),
                                                 (3, 2), (3, 3), (3,10),
                                                 (4, 15), (4, 14), (4, 9),
                                                 (5, 5), (5, 6), (5, 7);