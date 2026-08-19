package com.khaidai.core.data.local

import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.RoomDatabase
import kotlinx.serialization.json.Json
import kotlinx.serialization.KSerializer
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Offline snapshots of API responses, stored as the JSON we received.
 *
 * These payloads are already view-shaped -- the server composes each screen's
 * data, including labels and derived flags. Normalising them into relational
 * tables here would mean re-implementing that composition on the client and
 * keeping the two in step forever. Storing the response verbatim keeps the
 * server the single author of what a screen says, and gives the app something
 * to render when the network is gone.
 */
@Entity(tableName = "cached_responses")
data class CachedResponse(
    @PrimaryKey val key: String,
    val payload: String,
    val savedAt: Long,
)

@Dao
interface ResponseCacheDao {

    @Query("SELECT * FROM cached_responses WHERE key = :key LIMIT 1")
    suspend fun get(key: String): CachedResponse?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun put(entry: CachedResponse)

    @Query("DELETE FROM cached_responses")
    suspend fun clear()
}

@Database(entities = [CachedResponse::class], version = 1, exportSchema = false)
abstract class KhaiDaiDatabase : RoomDatabase() {
    abstract fun responseCacheDao(): ResponseCacheDao
}

/**
 * Typed access to the snapshot cache.
 */
@Singleton
class CacheStore @Inject constructor(
    private val dao: ResponseCacheDao,
    private val json: Json,
) {
    suspend fun <T> read(key: String, serializer: KSerializer<T>): T? {
        val entry = dao.get(key) ?: return null

        // A corrupt or outdated snapshot must never crash a screen -- treat it as
        // a cache miss and let the network fill in.
        return runCatching { json.decodeFromString(serializer, entry.payload) }.getOrNull()
    }

    suspend fun <T> write(key: String, serializer: KSerializer<T>, value: T) {
        runCatching {
            dao.put(
                CachedResponse(
                    key = key,
                    payload = json.encodeToString(serializer, value),
                    savedAt = System.currentTimeMillis(),
                ),
            )
        }
    }

    /** Called on sign-out: one member's cached data must not greet the next. */
    suspend fun clear() = dao.clear()
}
