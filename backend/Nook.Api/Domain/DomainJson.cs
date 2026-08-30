using System.Text.Json;

namespace Nook.Api.Domain;

public static class DomainJson
{
    private static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web);

    public static string Write<T>(T value) => JsonSerializer.Serialize(value, Options);

    public static List<T> ReadList<T>(string json) =>
        JsonSerializer.Deserialize<List<T>>(json, Options) ?? [];

    public static Dictionary<string, string> ReadDictionary(string json) =>
        JsonSerializer.Deserialize<Dictionary<string, string>>(json, Options) ?? [];
}
