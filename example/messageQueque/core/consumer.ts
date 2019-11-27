// 构建消费者

const consumer: () => void =  async () => {
    // 1. 创建链接对象
    const connection = await amqp.connect('amqp://localhost:5672');

    // 2. 获取通道
    const channel = await connection.createChannel();

    // 3. 声明参数
    const queueName = 'helloKoalaQueue';

    // 4. 声明队列，交换机默认为 AMQP default
    await channel.assertQueue(queueName);

    // 5. 消费
    await channel.consume(queueName, (msg: any) => {
        console.log('Consumer：', msg.content.toString());
        channel.ack(msg);
    });
}

consumer()