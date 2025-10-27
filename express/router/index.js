const express = require('express');

const router = express.Router();
const { readData, writeData } = require('../utils');

// 新增事项
router.post('/todo/add', async (req, res) => {
    const { body } = req;
    const [err, data] = await readData();
    if (err) {
        res.send({
            status: 200,
            msg: err.message
        });
        return;
    }

    const todoList = [...data, body];
    const [writeErr] = await writeData(todoList);
    if (writeErr) {
        res.send({
            status: 200,
            msg: writeErr.message
        });
        return;
    }

    res.send({
        status: 200,
        msg: '新增成功！'
    });
});

// 删除事项
router.delete('/todo/delete/:id', async (req, res) => {
    const id = req.params.id;
    const [err, data] = await readData();
    if (err) {
        res.send({
            status: 200,
            msg: err.message
        });
        return;
    }
    const todoList = data.filter(todo => todo.id !== id);
    const [writeErr] = await writeData(todoList);
    if (writeErr) {
        res.send({
            status: 200,
            msg: writeErr.message
        });
        return;
    }
    res.send({
        status: 200,
        msg: '删除成功！'
    });
});

// 更新事项
router.put('/todo/update/:id', async (req, res) => {
    const id = req.params.id;
    const [err, data] = await readData();
    if (err) {
        res.send({
            status: 200,
            msg: err.message
        });
        return;
    }
    const todoList = data.filter(todo => {
        if (todo.id === id) {
            todo.completed = !todo.completed;
        }
        return todo;
    });
    const [writeErr] = await writeData(todoList);
    if (writeErr) {
        res.send({
            status: 200,
            msg: writeErr.message
        });
        return;
    }
    res.send({
        status: 200,
        msg: '更新成功！'
    });
});

module.exports = router;
