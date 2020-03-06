package de.eismaenners.starter.eventbus;

import io.vertx.core.Handler;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.eventbus.Message;
import io.vertx.core.eventbus.MessageConsumer;
import io.vertx.core.json.JsonObject;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.logging.Level;
import java.util.logging.Logger;

import de.eismaenners.starter.MainVerticle;

public class EventBusConsumers {

    public static void setupConsumers(Object self, final EventBus eventBus) throws SecurityException {
        Arrays.stream(self.getClass().getMethods()).filter(method -> method.isAnnotationPresent(Consumes.class))
                .forEach(method -> addConsumerMethod(self, method, eventBus));
    }

    private static MessageConsumer<Object> addConsumerMethod(Object self, Method method, final EventBus eventBus) {
        Consumes annotation = method.getAnnotation(Consumes.class);
        return eventBus.consumer(annotation.path(), secureExecution(self, method, annotation.eventClass()));
    }

    private static <T> Handler<Message<Object>> secureExecution(Object self, Method method, Class<T> eventClass) {
        return (arg) -> {
            try {
                T obj = ((JsonObject) arg.body()).mapTo(eventClass);
                method.invoke(self, new Object[] { obj });
            } catch (IllegalAccessException | IllegalArgumentException | InvocationTargetException ex) {
                Logger.getLogger(MainVerticle.class.getName()).log(Level.SEVERE, null, ex);
            }
        };
    }

}
