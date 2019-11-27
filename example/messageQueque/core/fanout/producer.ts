const amqplib = require('amqplib');

const producer: () => void = async  ()  => {
    // 创建链接对象
    const connection = await amqplib.connect('amqp://localhost:5672');

    // 获取通道
    const channel = await connection.createChannel();

    // 声明参数
    const exchangeName = 'fanout_koala_exchange';
    const routingKey = '';
    const msg = 'hello koala';

    // 交换机
    await channel.assertExchange(exchangeName, 'fanout', {
        durable: true,
    });

    // 发送消息
    await channel.publish(exchangeName, routingKey, Buffer.from(msg));

    // 关闭链接
    await channel.close();
    await connection.close();
}


module.exports = producer
