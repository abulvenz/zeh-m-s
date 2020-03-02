package de.eismaenners.starter;

import java.util.function.Consumer;

import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

public class JsonUtils {

    public static JsonObject json() {
        return new JsonObject();
    }

    public static <T> void jsonTo(Class<T> bodyClass, RoutingContext ctx, Consumer<T> withBodyDo) {
        try {
            T obj = ctx.getBodyAsJson().mapTo(bodyClass);
            if (obj != null) {
                withBodyDo.accept(obj);
            }
        } catch (IllegalArgumentException e) {
            ctx.response().setStatusCode(400).end(e.getMessage());
        }
    }

}