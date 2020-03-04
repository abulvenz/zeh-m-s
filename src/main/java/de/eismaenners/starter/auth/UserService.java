package de.eismaenners.starter.auth;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.vertx.ext.mongo.MongoClient;

public class UserService {

    private MongoClient client;

    public UserService(MongoClient client) {
        this.client = client;
    }

    public static UserService create(MongoClient client) {
        return new UserService(client);
    }

    public static class User {
        @JsonProperty
        private final String email;
        @JsonProperty
        private final String password;

        public User() {
            email = null;
            password = null;
        }

        public String email() {
            return email;
        }

        public String password() {
            return password;
        }
    }
}
