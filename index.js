const express = require('express');
const sqlite = require('sqlite');
const bodyParse = require('body-parser')
const app = express();

const port = process.even.PORT || 3000 ;
const dbConnection = sqlite.open('banco.sqlite', { Promise })

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParse.urlencoded({extended: true}));

app.get('/', async(req, res) => {

    const db = await dbConnection

    const categoriasDb = await  db.all('select * from categorias');

    const vagas = await db.all('select * from vagas');

    const categorias = categoriasDb.map(cat => {

        return {
            ...cat,
            vagas: vagas.filter(vaga => vaga.categoria === cat.id),
        }
    });

    res.render('home', {
        categorias
    });

});

app.get('/vaga/:id',async  (req, res) => {
    const db = await dbConnection;
    const vaga  =  await db.get('select  * from vagas where id = '+ req.params.id);

    res.render('vaga', {
        vaga
    });
});

app.get('/admin', (req, res)=>{

    res.render('admin/home');
})

app.get('/admin/vagas', async (req, res) => {

    const db = await  dbConnection;
    const vagas = await db.all('select * from vagas');

    res.render('admin/vagas', {vagas})
});

app.get('/admin/vagas/nova', async (req, res)=>{
    const db = await dbConnection;
    const categorias = await db.all('select * from categorias')
    res.render('admin/nova-vaga', { categorias });
});


app.post('/admin/vagas/nova', async (req, res) => {
    const db = await  dbConnection;
    const {titulo, categoria, descricao } = req.body;
    await db.run(`INSERT into vagas (categoria, titulo, descricao) values(${categoria},'${titulo}', '${descricao}') `);
    res.redirect('/admin/vagas');
});

app.get('/admin/vagas/editar/:id', async (req, res)=>{
    const db = await dbConnection;
    const { id } = req.params;
    const categorias = await db.all('select * from categorias');
    const vaga = await db.get(`select * from vagas where id = ${id}`);
    res.render('admin/editar-vaga', { categorias, vaga });
});


app.post('/admin/vagas/editar/:id', async (req, res) => {
    const db = await  dbConnection;
    const {titulo, categoria, descricao } = req.body;
    const { id } = req.params;
    await db.run(`UPDATE vagas set categoria = ${categoria}, titulo = '${titulo}', descricao = '${descricao}' where id = ${id} `);
    res.redirect('/admin/vagas');
});

app.get('/admin/vagas/delete/:id', async (req, res) => {
    const db = await  dbConnection;
    await db.run(`delete from vagas where id = ${req.params.id}`);
    res.redirect('/admin/vagas');
});

/** configurando gerenciamento de categorias */
app.get('/admin/categoria', async (req, res) => {
    const db = await dbConnection;
    const categorias = await db.all('select * from categorias');
    res.render('admin/gerenciar-categoria', {categorias});
});

app.get('/admin/gerenciar-categoria/delete/:id', async (req, res)=>{
    const db = await dbConnection;
    await db.run(`delete from categorias where id = ${req.params.id}`);
    res.redirect('/admin/categoria');
});

app.get('/admin/categoria/nova', async (req, res)=>{
    const db = await dbConnection;
    const categorias = await db.all('select * from categorias');

    res.render('admin/nova-categoria', { categorias });

});
app.post('/admin/categoria/nova', async(req, res) => {
    const db = await dbConnection;
    const {categoria} = req.body;
    await db.run(`INSERT into categorias (categoria) values('${categoria}')`);

    res.redirect('/admin/categoria');
})

app.get('/admin/gerenciar-categoria/editar/:id', async (req, res)=>{
    const db = await dbConnection;
    const categoria = await db.get(`select * from categorias where id = ${req.params.id}`);
    res.render('admin/editar-categoria', {categoria});
});

app.post('/admin/gerenciar-categoria/editar/:id', async (req, res)=>{
    const db = await  dbConnection;
    const { categoria } = req.body;
    const { id } = req.params;
    await db.run(`UPDATE categorias set categoria = '${categoria}' where id = ${id}`);
    res.redirect('/admin/categoria');
});


const init = async() => {
  
    const db = await dbConnection;
    await db.run('create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT);');
    await db.run('create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT);');

    //const categoria = 'marking';
    //await db.run(`INSERT into categorias (categoria) values('${categoria}') `);
}

init();

app.listen(port, (err) => {
    if (err) {
        console.log('Servidor não rodou!')
    } else {
        console.log('Servidor rodando')
    }
});
