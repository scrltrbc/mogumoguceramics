DROP TABLE IF EXISTS produse;

DROP TYPE IF EXISTS categ_produs;
DROP TYPE IF EXISTS culori;

CREATE TYPE categ_produs AS ENUM('vaza', 'figurina', 'breloc', 'floare', 'buchet', 'vesela');
CREATE TYPE culori AS ENUM('roz', 'violet', 'galben', 'portocaliu', 'verde', 'negru', 'maro', 'rosu', 'albastru', 'alb', 'multicolor', 'gri', 'bej');


CREATE TABLE IF NOT EXISTS produse (
                                       id serial PRIMARY KEY,
                                       denumire VARCHAR(50) UNIQUE NOT NULL,
    descriere TEXT,
    pret NUMERIC(8,2) NOT NULL,
    dimensiuni INT NOT NULL CHECK (dimensiuni>=0),
    categorie categ_produs DEFAULT 'figurina',
    culoare culori DEFAULT 'multicolor',
    materiale VARCHAR [],
    personalizabil BOOLEAN NOT NULL DEFAULT FALSE,
    imagine VARCHAR(300),
    data_adaugare TIMESTAMP DEFAULT current_timestamp
    );

INSERT into produse (denumire,descriere,pret, dimensiuni, categorie, culoare, materiale, personalizabil, imagine) VALUES
                                                                                                                      ('Set 3 Vaze', 'Un set de 3 vaze brutaliste', 99.99 , 12, 'vaza', 'multicolor', '{"argila","lac de finisare"}', TRUE, 'vazejysk.jpeg'),

                                                                                                                      ('Buchet Gratitudine - roz', 'Un buchet de orhidee, hortensie și garoafă ce exprimă gratitudine, frumusețe și tărie', 149.90, 20, 'buchet', 'roz', '{"lut","pastel","lac de finisare","fir metalic"}', FALSE, 'roz1.jpeg'),

                                                                                                                      ('Buchet Gratitudine - violet', 'Un buchet de orhidee, hortensie și garoafă ce exprimă gratitudine, frumusețe și tărie', 149.90, 20, 'buchet', 'violet', '{"lut","pastel","lac de finisare","fir metalic"}', FALSE, 'movgalben1.jpeg'),

                                                                                                                      ('Buchet Gratitudine - mărțișor', 'O variantă mai micuță a unui buchet de orhidee, hortensie și garoafă ce exprimă gratitudine, frumusețe și tărie, cadoul perfect de 1 martie', 69.99, 12, 'buchet', 'violet', '{"lut","pastel","fir metalic"}', FALSE, 'martisor1.jpeg'),

                                                                                                                      ('Cap de clovn', 'O figurină ce reprezintă un căpșor de clovn', 29.99, 5, 'figurina', 'maro', '{"lut","pastel", "vopseluri acrilice", "lac de finisare"}', TRUE, 'euclovn.jpeg'),

                                                                                                                      ('Breloc MyMelody', 'Un breloc cu îndrăgitul personaj Sanrio MyMelody', 32.49, 3, 'breloc', 'roz', '{"lut","pastel","breloc"}', FALSE, 'mymelo2.jpeg'),

                                                                                                                      ('Breloc Cristi', 'Un breloc cu îndrăgitul personaj FMI Cristi', 20.00, 3, 'breloc', 'portocaliu', '{"lut","pastel","lac de finisare", "vopseluri acrilice", "breloc"}', TRUE, 'cristi2.jpeg'),

                                                                                                                      ('Suport de Lumânare Ioana', 'Un suport de lumânare drăguț și chique', 99.90, 8, 'figurina', 'multicolor', '{"lut","pastel","lac de finisare","vopseluri acrilice"}', TRUE, 'lumanare4.jpg'),

                                                                                                                      ('Floare licurici', 'Flori ce strălucesc în întuneric', 11.90, 3, 'floare', 'multicolor', '{"lut","pastel","lac de finisare","vopseluri UV", "fir metalic"}', TRUE, 'fluorescent.jpeg'),

                                                                                                                      ('Buchet de primăvară', 'Un buchet primăvăratic cu lalele, margarete și alte floricele', 99.99, 12, 'buchet', 'multicolor', '{"lut","pastel", "fir metalic"}', FALSE, 'buchetprimavara2.jpg'),

                                                                                                                      ('Buchet de vară', 'Un buchet văratic cu floarea soarelui, lotus și frunze', 75.00, 18, 'buchet', 'multicolor', '{"lut","pastel", "lac de finisare", "fir metalic"}', FALSE, 'soarecool.jpg'),

                                                                                                                      ('Floare de Lotus', 'O floare de lotus', 15.95, 10, 'floare', 'portocaliu', '{"lut","pastel", "lac de finisare", "fir metalic"}', FALSE, 'soarezoom.jpg'),

                                                                                                                      ('Vază albă', 'O vază albă', 19.99, 18, 'vaza', 'alb', '{"lut", "lac de finisare"}', FALSE, 'stilren1.jpeg'),

                                                                                                                      ('Set bol+lingură de Ramen', 'Un bol adânc și o lingură pentru a vă bucura de un ramen delicios', 129.99, 20, 'vesela', 'alb', '{"ceramica"}', FALSE, 'ramen.jpeg'),

                                                                                                                      ('Set bol+bețișoare de Noodles', 'Bucurați-vă de niște noodleși cu acest set special !Pisica nu este inclusă!', 119.99, 18, 'vesela', 'alb', '{"ceramica","lemn"}', TRUE, 'noodles.jpeg');
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rebeca;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rebeca;
commit;