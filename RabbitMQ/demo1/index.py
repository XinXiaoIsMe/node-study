import pika

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))

channel = connection.channel()

queueName = 'task_queue'

channel.queue_declare(queue=queueName,durable=True)

message = '小满zs'

channel.basic_publish(exchange='',routing_key=queueName,body=message)

connection.close()
