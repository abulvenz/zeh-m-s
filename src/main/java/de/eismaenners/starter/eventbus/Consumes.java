package de.eismaenners.starter.eventbus;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
public @interface Consumes {
    String path();

    Class<?> eventClass();
}
